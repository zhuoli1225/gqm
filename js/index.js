const { createApp, reactive, computed, onMounted } = Vue

const App = {
  setup() {
    const state = reactive({
      items: [],
      shareLinks: [],
      currentPage: 'home',
      copiedId: null,
      showModal: false,
      newTitle: '',
      newCode: '',
      shareSearchQuery: '',
      logoClickCount: 0, // Hidden admin trigger
      // Admin Login Modal
      showAdminModal: false,
      adminPasswordInput: '',
    })

    const filteredLinks = computed(() => state.items.slice())

    // --- Hidden Admin Entrance ---
    function handleLogoClick() {
      state.logoClickCount++
      
      if (state.logoClickCount === 5) {
        state.logoClickCount = 0 // Reset
        state.showAdminModal = true
      }
    }

    async function submitAdminLogin() {
      if (!state.adminPasswordInput) return;
      
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/login`, { password: state.adminPasswordInput });
        if (response.data.success) {
          localStorage.setItem('gqm_admin_auth', 'true');
          state.showAdminModal = false;
          state.adminPasswordInput = '';
          alert('认证成功，即将跳转后台');
          window.location.href = 'admin.html';
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert('密码错误');
        } else {
          alert('验证失败，请检查网络或服务器');
          console.error(error);
        }
      }
    }

    const filteredShareLinks = computed(() => {
      if (!state.shareSearchQuery.trim()) {
        return state.shareLinks.slice()
      }
      const query = state.shareSearchQuery.toLowerCase()
      return state.shareLinks.filter(item => 
        item.name.toLowerCase().includes(query)
      )
    })

    async function load() {
      // 加载首页数据
      try {
        const indexResponse = await axios.get(`${API_BASE_URL}/index`);
        state.items = indexResponse.data;
      } catch (error) {
        console.error('获取首页数据失败:', error);
        // alert('获取首页数据失败');
        state.items = [];
      }

      // 加载分享页数据
      try {
        const shareResponse = await axios.get(`${API_BASE_URL}/gqm`);
        state.shareLinks = shareResponse.data;
      } catch (error) {
        console.error('获取改枪码失败:', error);
        // alert('获取数据失败');
        state.shareLinks = [];
      }
    }

    function copyShareLink(id, url) {
      navigator.clipboard.writeText(url).then(() => {
        state.copiedId = id
        setTimeout(() => {
          state.copiedId = null
        }, 2000)
      }).catch(err => {
        alert('复制失败，请手动复制链接：' + url)
      })
    }

    async function addCode() {
      if (!state.newTitle.trim() || !state.newCode.trim()) {
        alert('请填写标题和改枪码')
        return
      }

      const now = new Date()
      const timeString = now.toLocaleString('zh-CN', { hour12: false })
      const formattedTime = `新增于 ${timeString}`
      
      try {
        const response = await axios.post(`${API_BASE_URL}/gqm`, {
          name: state.newTitle,
          desc: state.newCode,
          time: formattedTime
        });

        if (response.status === 201) {
          const newItem = response.data.data;
          // 更新界面：插入到最前面
          state.shareLinks.unshift(newItem);
          
          // 重置表单并关闭
          state.newTitle = '';
          state.newCode = '';
          state.showModal = false;
        }
      } catch (error) {
        console.error('新增失败:', error);
        alert('新增失败，请稍后重试');
      }
    }

    onMounted(load)

    return {
      ...Vue.toRefs(state),
      filteredLinks,
      filteredShareLinks,
      copyShareLink,
      addCode,
      handleLogoClick,
      submitAdminLogin,
    }
  }
}

createApp(App).mount('#app')
