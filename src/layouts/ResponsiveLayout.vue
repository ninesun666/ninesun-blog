<template>
  <div class="layout-responsive">
    <header class="layout-header">
      <slot name="header"></slot>
    </header>
    
    <main class="layout-main">
      <div class="main-container">
        <div class="content-wrapper" :class="{ 'full-width': !showSidebar }">
          <div class="content-area">
            <slot name="content"></slot>
          </div>
          
          <aside v-if="showSidebar" class="sidebar">
            <slot name="sidebar"></slot>
          </aside>
        </div>
      </div>
    </main>
    
    <footer class="layout-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'ResponsiveLayout',
  props: {
    showSidebar: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.layout-responsive {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.layout-header {
  width: 100%;
  flex-shrink: 0;
}

.layout-main {
  flex: 1;
  width: 100%;
  padding: var(--spacing-lg, 2rem) 0;
}

.main-container {
  width: 100%;
  max-width: var(--container-max-width, 1400px);
  margin: 0 auto;
  padding: 0 var(--spacing-lg, 2rem);
  box-sizing: border-box;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width, 320px);
  gap: var(--grid-gap-lg, 2rem);
  width: 100%;
}

.content-wrapper.full-width {
  grid-template-columns: 1fr;
}

.content-area {
  min-width: 0; /* Prevent grid item overflow */
}

.sidebar {
  min-width: 0;
}

.layout-footer {
  width: 100%;
  flex-shrink: 0;
  margin-top: auto;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .main-container {
    padding: 0 var(--spacing-md, 1.5rem);
  }
  
  .content-wrapper {
    grid-template-columns: 1fr var(--sidebar-width-md, 280px);
  }
}

@media (max-width: 992px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    margin-top: var(--spacing-lg, 2rem);
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 0 var(--spacing-sm, 1rem);
  }
}

@media (min-width: 1920px) {
  .main-container {
    max-width: var(--container-max-width-xl, 1600px);
  }
}
</style>
