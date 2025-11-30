package com.codecampus.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import com.codecampus.service.UserService;

import java.io.IOException;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public JwtAuthFilter(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    /*
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        logger.info("Incoming request: {} {}", method, requestURI);

        // Skip OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ Skip JWT auth only for GET /api/activities/**
        if ("GET".equalsIgnoreCase(method) && requestURI.startsWith("/api/activities")) {
            logger.info("Skipping JWT auth for GET /api/activities/**");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Inline token resolution
            String bearer = request.getHeader("Authorization");
            String token = (StringUtils.hasText(bearer) && bearer.startsWith("Bearer "))
                    ? bearer.substring(7)
                    : null;

            logger.info("Resolved token: {}", token);

            if (token != null && jwtUtil.isTokenValid(token)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                String username = jwtUtil.extractUsername(token);
                UserDetails userDetails = userService.loadUserByUsername(username);

                var authorities = userDetails.getAuthorities().stream()
                        .map(auth -> auth.getAuthority().startsWith("ROLE_")
                                ? auth
                                : new SimpleGrantedAuthority("ROLE_" + auth.getAuthority()))
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.info("Authentication set for user: {} with authorities: {}", username, authorities);
            }

        } catch (Exception ex) {
            logger.warn("JWT authentication failed: {}", ex.getMessage());
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.info("No authentication present in context");
        }

        filterChain.doFilter(request, response);
    } */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip OPTIONS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = resolveToken(request);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String username = jwtUtil.extractUsername(token);
                UserDetails userDetails = userService.loadUserByUsername(username);

                if (jwtUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Authenticated user: {} for URI: {}", username, request.getRequestURI());
                }
            } catch (Exception e) {
                logger.warn("JWT authentication failed: {}", e.getMessage());
                logger.info("Authorization header: {}", request.getHeader("Authorization"));
                logger.info("Resolved token: {}", token);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Resolve the token from the Authorization header.
     * Works even if the request is multipart.
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // If header is missing and multipart, try alternative
        if (bearerToken == null && request.getContentType() != null
                && request.getContentType().toLowerCase().startsWith("multipart/")) {
            // Some browsers strip headers in multipart; this is a safe fallback if needed
            bearerToken = request.getParameter("Authorization");
        }

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}