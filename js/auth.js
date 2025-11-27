// Simple frontend auth check
(function() {
    const isAuthenticated = localStorage.getItem('gqm_admin_auth');
    if (isAuthenticated !== 'true') {
        // Record current path for redirect after login? 
        // For now, just redirect to index.html
        alert('非法访问：请先通过首页验证');
        window.location.href = 'index.html';
    }
})();
