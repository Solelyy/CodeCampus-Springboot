// ---------- Leaderboard Dynamic Data ----------
document.addEventListener('DOMContentLoaded', () => {
  const leaderboardData = [
    { rank: 1, name: 'Jessa Gozun', points: 100, activities: 10, lastCompleted: 'Oct 13, 2025' },
    { rank: 2, name: 'Mark Reyes', points: 90, activities: 9, lastCompleted: 'Oct 12, 2025' },
    { rank: 3, name: 'Aira Santos', points: 80, activities: 8, lastCompleted: 'Oct 11, 2025' },
    { rank: 4, name: 'Leo Cruz', points: 70, activities: 7, lastCompleted: 'Oct 9, 2025' },
    { rank: 5, name: 'Ella Dela Cruz', points: 60, activities: 6, lastCompleted: 'Oct 8, 2025' }
  ];

  const tableBody = document.getElementById('leaderboard-body');
  tableBody.innerHTML = leaderboardData.map(student => `
    <tr>
      <td>${student.rank}</td>
      <td>${student.name}</td>
      <td>${student.points}</td>
      <td>${student.activities}</td>
      <td>${student.lastCompleted}</td>
    </tr>
  `).join('');
});
