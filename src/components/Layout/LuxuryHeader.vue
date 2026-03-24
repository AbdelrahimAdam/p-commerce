<!-- src/components/Layout/LuxuryHeader.vue -->
<template>
  <header class="luxury-header" :class="{ 'scrolled': scrolled, 'rtl': isRTL }">
    <!-- Header Container -->
    <div class="luxury-header-container">
      <!-- Top Bar -->
      <div class="luxury-top-bar">
        <!-- Left: Logo -->
        <router-link to="/" class="luxury-logo-container">
          <div class="luxury-logo-icon">
            <div class="logo-inner">
              <div class="luxury-p-logo">{{ brandLetter }}</div>
            </div>
          </div>
          <div class="luxury-logo-text">
            <h1 class="logo-title">{{ storeName }}</h1>
            <p class="logo-subtitle">{{ storeTagline }}</p>
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="luxury-nav-desktop">
          <ul class="luxury-nav-list">
            <li class="luxury-nav-item">
              <router-link to="/" class="luxury-nav-link" active-class="active" exact>
                {{ languageStore.t('home') }}
              </router-link>
              <div class="nav-preview">
                <div class="preview-content">
                  <h4 class="preview-title">Home</h4>
                  <p class="preview-description">Discover our latest luxury fragrances</p>
                </div>
              </div>
            </li>
            <li class="luxury-nav-item">
              <router-link to="/shop" class="luxury-nav-link" active-class="active">
                {{ languageStore.t('shop') }}
              </router-link>
              <div class="nav-preview">
                <div class="preview-content">
                  <h4 class="preview-title">Shop</h4>
                  <p class="preview-description">Browse all our premium perfumes</p>
                </div>
              </div>
            </li>
            <li class="luxury-nav-item">
              <router-link to="/brands" class="luxury-nav-link" active-class="active">
                {{ languageStore.t('brands') }}
              </router-link>
              <div class="nav-preview">
                <div class="preview-content">
                  <h4 class="preview-title">Brands</h4>
                  <p class="preview-description">Explore luxury perfume houses</p>
                </div>
              </div>
            </li>
            <li class="luxury-nav-item">
              <router-link to="/category/mens" class="luxury-nav-link" active-class="active">
                {{ languageStore.t('mens') }}
              </router-link>
              <div class="nav-preview">
                <div class="preview-content">
                  <h4 class="preview-title">Men's Collection</h4>
                  <p class="preview-description">Bold fragrances for the modern gentleman</p>
                </div>
              </div>
            </li>
            <li class="luxury-nav-item">
              <router-link to="/category/womens" class="luxury-nav-link" active-class="active">
                {{ languageStore.t('womens') }}
              </router-link>
              <div class="nav-preview">
                <div class="preview-content">
                  <h4 class="preview-title">Women's Collection</h4>
                  <p class="preview-description">Elegant perfumes that capture timeless beauty</p>
                </div>
              </div>
            </li>
            <li class="luxury-nav-item">
              <router-link to="/category/unisex" class="luxury-nav-link" active-class="active">
                {{ languageStore.t('unisex') }}
              </router-link>
              <div class="nav-preview">
                <div class="preview-content">
                  <h4 class="preview-title">Unisex Collection</h4>
                  <p class="preview-description">Fragrances for everyone, transcending boundaries</p>
                </div>
              </div>
            </li>
            <li class="luxury-nav-item">
              <router-link to="/about" class="luxury-nav-link" active-class="active">
                {{ languageStore.t('about') }}
              </router-link>
              <div class="nav-preview">
                <div class="preview-content">
                  <h4 class="preview-title">About Us</h4>
                  <p class="preview-description">Our story and passion for luxury fragrances</p>
                </div>
              </div>
            </li>
            <li class="luxury-nav-item">
              <router-link to="/contact" class="luxury-nav-link" active-class="active">
                {{ languageStore.t('contact') }}
              </router-link>
              <div class="nav-preview">
                <div class="preview-content">
                  <h4 class="preview-title">Contact</h4>
                  <p class="preview-description">Get in touch with our concierge team</p>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        <!-- Right: Actions -->
        <div class="luxury-header-right">
          <!-- Desktop Actions -->
          <div class="luxury-desktop-section">
            <div class="luxury-header-toggles">
              <LuxuryLanguageToggle />
            </div>

            <div class="luxury-header-actions">
              <button class="luxury-header-action" @click="toggleSearch" :aria-label="languageStore.t('search')">
                <svg class="luxury-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <!-- Unified User Login / Account -->
              <button 
                v-if="!isAuthenticated" 
                class="luxury-header-action" 
                @click="router.push('/login')" 
                :aria-label="languageStore.t('login')"
              >
                <svg class="luxury-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                        stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 20C3 16.6863 5.68629 14 9 14H15C18.3137 14 21 16.6863 21 20V21H3V20Z" 
                        stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </button>

              <button v-else class="luxury-header-action" @click="handleUserClick" :aria-label="languageStore.t('account')">
                <svg class="luxury-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                        stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 20C3 16.6863 5.68629 14 9 14H15C18.3137 14 21 16.6863 21 20V21H3V20Z" 
                        stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </button>

              <!-- Wishlist Link -->
              <router-link to="/wishlist" class="luxury-header-action">
                <svg class="luxury-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-if="wishlistStore.totalItems > 0" class="wishlist-badge">{{ wishlistStore.totalItems > 99 ? '99+' : wishlistStore.totalItems }}</span>
              </router-link>

              <!-- Cart Link -->
              <router-link to="/cart" class="luxury-header-action">
                <svg class="luxury-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 
11-4 0 2 2 0 014 0z" 
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-if="cartStore.totalItems > 0" class="cart-badge">{{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}</span>
              </router-link>
            </div>
          </div>

          <!-- Mobile Actions Row -->
          <div class="mobile-actions-row">
            <!-- Only hamburger, cart, and wishlist on mobile -->
            <!-- Wishlist Link (Mobile) -->
            <router-link to="/wishlist" class="mobile-action-icon-link">
              <svg class="mobile-icon" viewBox="0 0 24 24" fill="none">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-if="wishlistStore.totalItems > 0" class="mobile-wishlist-badge">{{ wishlistStore.totalItems > 99 ? '99+' : wishlistStore.totalItems 
}}</span>
            </router-link>

            <!-- Cart Link (Mobile) -->
            <router-link to="/cart" class="mobile-action-icon-link">
              <svg class="mobile-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 
0 2 2 0 014 0z" 
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-if="cartStore.totalItems > 0" class="mobile-cart-badge">{{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}</span>
            </router-link>

            <!-- Menu Toggle (Hamburger) -->
            <button class="luxury-mobile-toggle" @click="toggleMobileMenu" :class="{ 'open': mobileMenuOpen }" :aria-label="languageStore.t('menu')">
              <span class="mobile-toggle-line"></span>
              <span class="mobile-toggle-line"></span>
              <span class="mobile-toggle-line"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div v-if="mobileMenuOpen" class="luxury-mobile-overlay" @click="closeMobileMenu"></div>

    <!-- Mobile Menu (Half Screen) -->
    <div class="luxury-mobile-menu" :class="{ 'open': mobileMenuOpen }">
      <div class="mobile-menu-container">
        <div class="mobile-menu-header">
          <div class="mobile-menu-logo">
            <div class="mobile-logo-icon">
              <div class="mobile-logo-inner">
                <div class="mobile-logo-p">{{ brandLetter }}</div>
              </div>
            </div>
            <div class="mobile-logo-text">
              <h3 class="mobile-logo-title">{{ storeName }}</h3>
              <p class="mobile-logo-subtitle">{{ storeTagline }}</p>
            </div>
          </div>
          <button class="mobile-menu-close" @click="closeMobileMenu" :aria-label="languageStore.t('close')">
            <svg class="luxury-icon" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="1.5" 
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="mobile-menu-content">
          <!-- Mobile Navigation -->
          <nav class="mobile-nav">
            <ul class="mobile-nav-list">
              <li class="mobile-nav-item">
                <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu" exact>
                  {{ languageStore.t('home') }}
                </router-link>
              </li>
              <li class="mobile-nav-item">
                <router-link to="/shop" class="mobile-nav-link" @click="closeMobileMenu">
                  {{ languageStore.t('shop') }}
                </router-link>
              </li>
              <li class="mobile-nav-item">
                <router-link to="/brands" class="mobile-nav-link" @click="closeMobileMenu">
                  {{ languageStore.t('brands') }}
                </router-link>
              </li>
              <li class="mobile-nav-item">
                <router-link to="/category/mens" class="mobile-nav-link" @click="closeMobileMenu">
                  {{ languageStore.t('mens') }}
                </router-link>
              </li>
              <li class="mobile-nav-item">
                <router-link to="/category/womens" class="mobile-nav-link" @click="closeMobileMenu">
                  {{ languageStore.t('womens') }}
                </router-link>
              </li>
              <li class="mobile-nav-item">
                <router-link to="/category/unisex" class="mobile-nav-link" @click="closeMobileMenu">
                  {{ languageStore.t('unisex') }}
                </router-link>
              </li>
              <li class="mobile-nav-item">
                <router-link to="/about" class="mobile-nav-link" @click="closeMobileMenu">
                  {{ languageStore.t('about') }}
                </router-link>
              </li>
              <li class="mobile-nav-item">
                <router-link to="/contact" class="mobile-nav-link" @click="closeMobileMenu">
                  {{ languageStore.t('contact') }}
                </router-link>
              </li>
            </ul>
          </nav>

          <!-- Mobile Actions -->
          <div class="mobile-actions">
            <!-- Language Toggle (inside sidebar) -->
            <div class="mobile-action-btn" @click="closeMobileMenu">
              <LuxuryLanguageToggle />
            </div>

            <!-- Search (inside sidebar) -->
            <button class="mobile-action-btn" @click="handleMobileAction('search')">
              <svg class="mobile-action-icon" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ languageStore.t('search') }}</span>
            </button>

            <!-- Unified Login/Account in Mobile Menu -->
            <template v-if="!isAuthenticated">
              <router-link to="/login" class="mobile-action-btn" @click="closeMobileMenu">
                <svg class="mobile-action-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                        stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 20C3 16.6863 5.68629 14 9 14H15C18.3137 14 21 16.6863 21 20V21H3V20Z" 
                        stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span>{{ languageStore.t('login') }}</span>
              </router-link>

              <router-link to="/register" class="mobile-action-btn" @click="closeMobileMenu">
                <svg class="mobile-action-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ languageStore.t('register') }}</span>
              </router-link>
            </template>

            <template v-else>
              <router-link to="/account" class="mobile-action-btn" @click="closeMobileMenu">
                <svg class="mobile-action-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                        stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 20C3 16.6863 5.68629 14 9 14H15C18.3137 14 21 16.6863 21 20V21H3V20Z" 
                        stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span>{{ languageStore.t('account') }}</span>
              </router-link>
            </template>

            <!-- Returns in Mobile Menu -->
            <router-link to="/returns" class="mobile-action-btn" @click="closeMobileMenu">
              <svg class="mobile-action-icon" viewBox="0 0 24 24" fill="none">
                <path d="M16 15v-1a4 4 0 00-8 0v1m-4 0a4 4 0 014-4h8a4 4 0 014 4v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4z" 
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 5v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ languageStore.t('returns') }}</span>
            </router-link>

            <!-- Admin Panel (if admin) -->
            <router-link v-if="isAdmin" to="/admin" class="mobile-action-btn" @click="closeMobileMenu">
              <svg class="mobile-action-icon" viewBox="0 0 24 24" fill="none">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 
2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 
0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 
001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ languageStore.t('adminPanel') }}</span>
            </router-link>

            <!-- Logout (if authenticated) -->
            <button v-if="isAuthenticated" @click="handleLogout" class="mobile-action-btn logout-btn">
              <svg class="mobile-action-icon" viewBox="0 0 24 24" fill="none">
                <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16C13 17.6569 11.6569 19 10 19H6C4.34315 19 3 17.6569 3 16V8C3 6.34315 4.34315 5 6 5H10C11.6569 5 
13 6.34315 13 8" 
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ languageStore.t('logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Menu Dropdown (For Authenticated Users) -->
    <div v-if="userMenuOpen && isAuthenticated" class="luxury-dropdown user-dropdown" @click.stop>
      <div class="dropdown-content">
        <div class="dropdown-user">
          <div class="user-avatar">
            <span class="avatar-initials">{{ userInitials }}</span>
          </div>
          <div class="user-info">
            <h4 class="user-name">{{ user?.displayName || languageStore.t('customer') }}</h4>
            <p class="user-email">{{ user?.email }}</p>
          </div>
        </div>

        <div class="dropdown-menu">
          <router-link to="/account" class="dropdown-item" @click="userMenuOpen = false">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" 
                    stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 20C6 16.6863 8.68629 14 12 14C15.3137 14 18 16.6863 18 20V21H6V20Z" 
                    stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span>{{ languageStore.t('profile') }}</span>
          </router-link>

          <router-link to="/orders" class="dropdown-item" @click="userMenuOpen = false">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 
9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" 
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ languageStore.t('orders') }}</span>
          </router-link>

          <router-link to="/returns" class="dropdown-item" @click="userMenuOpen = false">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
              <path d="M16 15v-1a4 4 0 00-8 0v1m-4 0a4 4 0 014-4h8a4 4 0 014 4v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4z" 
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 5v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ languageStore.t('returns') }}</span>
          </router-link>

          <router-link to="/wishlist" class="dropdown-item" @click="userMenuOpen = false">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ languageStore.t('wishlist') }}</span>
          </router-link>

          <router-link v-if="isAdmin" to="/admin" class="dropdown-item" @click="userMenuOpen = false">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
              <path d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.861 5.151 14.687 5.657 15.514 5.421C17.227 4.926 18.675 6.374 18.18 
8.087C17.944 8.914 18.45 9.74 19.284 9.926C21.04 10.352 21.04 12.85 19.284 13.276C18.45 13.462 17.944 14.288 18.18 15.115C18.675 16.828 17.227 18.276 15.514 
17.781C14.687 17.545 13.861 18.051 13.675 18.885C13.249 20.641 10.751 20.641 10.325 18.885C10.139 18.051 9.313 17.545 8.486 17.781C6.773 18.276 5.325 16.828 
5.82 15.115C6.056 14.288 5.55 13.462 4.716 13.276C2.96 12.85 2.96 10.352 4.716 9.926C5.55 9.74 6.056 8.914 5.82 8.087C5.325 6.374 6.773 4.926 8.486 
5.421C9.313 5.657 10.139 5.151 10.325 4.317Z" 
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" 
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ languageStore.t('adminPanel') }}</span>
          </router-link>

          <button @click="handleLogout" class="dropdown-item logout-btn">
            <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
              <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16C13 17.6569 11.6569 19 10 19H6C4.34315 19 3 17.6569 3 16V8C3 6.34315 4.34315 5 6 5H10C11.6569 5 13 
6.34315 13 8" 
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ languageStore.t('logout') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search Modal -->
    <div v-if="searchOpen" class="luxury-search-overlay" @click="searchOpen = false">
      <div class="search-modal" @click.stop>
        <div class="search-input-container">
          <input type="text" class="search-input" :placeholder="languageStore.t('search') + '...'" autofocus>
          <button class="search-close" @click="searchOpen = false">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="1.5" 
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useTenantStore } from '@/stores/tenant'
import LuxuryLanguageToggle from '@/components/UI/LuxuryLanguageToggle.vue'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const tenantStore = useTenantStore()

const { user, isAuthenticated, isAdmin, logout } = authStore

// State
const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const searchOpen = ref(false)

// Tenant-aware branding
const storeName = computed(() => {
  if (tenantStore.tenantId === 'main') {
    return 'P.COMMERCE'
  }
  return 'P.COMMERCE'
})

const storeTagline = computed(() => {
  if (tenantStore.tenantId === 'main') {
    return 'LUXURY PERFUME STORE'
  }
  return 'PERFUME STORE'
})

const brandLetter = computed(() => {
  return storeName.value.charAt(0).toUpperCase()
})

// Computed
const userInitials = computed(() => {
  if (!user || !user.displayName) return 'U'
  return user.displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const isRTL = computed(() => languageStore.currentLanguage === 'ar')

// Methods
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (mobileMenuOpen.value) {
    document.body.classList.add('no-scroll')
    userMenuOpen.value = false
    searchOpen.value = false
  } else {
    document.body.classList.remove('no-scroll')
  }
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  document.body.classList.remove('no-scroll')
}

const handleUserClick = () => {
  if (isAuthenticated) {
    userMenuOpen.value = !userMenuOpen.value
    if (userMenuOpen.value) {
      mobileMenuOpen.value = false
      searchOpen.value = false
    }
  }
}

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    document.body.classList.add('no-scroll')
    mobileMenuOpen.value = false
    userMenuOpen.value = false
  } else {
    document.body.classList.remove('no-scroll')
  }
}

const handleMobileAction = (action: string) => {
  closeMobileMenu()
  switch(action) {
    case 'search':
      toggleSearch()
      break
  }
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  
  if (mobileMenuOpen.value && target.closest('.luxury-mobile-overlay')) {
    closeMobileMenu()
  }
  
  if (userMenuOpen.value && 
      !target.closest('.user-dropdown') && 
      !target.closest('.luxury-header-action[aria-label="account"]')) {
    userMenuOpen.value = false
  }
}

const handleLogout = async () => {
  try {
    await logout()
    userMenuOpen.value = false
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (searchOpen.value) {
      searchOpen.value = false
      document.body.classList.remove('no-scroll')
    }
    if (userMenuOpen.value) {
      userMenuOpen.value = false
    }
    if (mobileMenuOpen.value) {
      closeMobileMenu()
    }
  }
}

const updateDirection = () => {
  const direction = isRTL.value ? 'rtl' : 'ltr'
  document.documentElement.dir = direction
  document.documentElement.lang = languageStore.currentLanguage
  
  if (isRTL.value) {
    document.body.classList.add('rtl')
  } else {
    document.body.classList.remove('rtl')
  }
}

watch(() => languageStore.currentLanguage, () => {
  updateDirection()
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  
  updateDirection()
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('no-scroll')
})
</script>

<style scoped>
/* ========== LUXURY HEADER STYLES ========== */
.luxury-header {
  background: linear-gradient(180deg, 
    rgba(10, 10, 10, 0.98) 0%, 
    rgba(26, 18, 11, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Add padding to the main content to account for fixed header */
:global(body) {
  padding-top: 69px;
}

@media (max-width: 768px) {
  :global(body) {
    padding-top: 53px;
  }
}

.luxury-header.scrolled {
  background: rgba(10, 10, 10, 0.98);
  border-bottom-color: rgba(212, 175, 55, 0.25);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.luxury-header.rtl {
  direction: rtl;
}

.luxury-header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 768px) {
  .luxury-header-container {
    padding: 0 1rem;
  }
}

/* Top Bar */
.luxury-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  gap: 2rem;
  position: relative;
}

@media (max-width: 768px) {
  .luxury-top-bar {
    padding: 0.5rem 0;
    gap: 1rem;
  }
}

/* Logo */
.luxury-logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  min-width: 0;
  z-index: 1001;
}

.luxury-logo-container:hover {
  transform: scale(1.02);
}

.luxury-logo-icon {
  width: 44px;
  height: 44px;
  position: relative;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .luxury-logo-icon {
    width: 36px;
    height: 36px;
  }
}

.logo-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.4);
  border: 1px solid rgba(212, 175, 55, 0.3);
  animation: logo-glow 3s ease-in-out infinite;
}

@keyframes logo-glow {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.3),
                0 0 60px rgba(212, 175, 55, 0.1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(212, 175, 55, 0.5),
                0 0 100px rgba(212, 175, 55, 0.2);
  }
}

.luxury-p-logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .luxury-p-logo {
    font-size: 1.4rem;
  }
}

.luxury-logo-text {
  text-align: left;
  min-width: 0;
  overflow: hidden;
}

.luxury-header.rtl .luxury-logo-text {
  text-align: right;
}

.logo-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #d4af37;
  margin: 0;
  letter-spacing: 0.5px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .logo-title {
    font-size: 1rem;
  }
}

.logo-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.6rem;
  color: #999999;
  margin: 0.2rem 0 0 0;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

@media (max-width: 768px) {
  .logo-subtitle {
    font-size: 0.5rem;
    letter-spacing: 1px;
  }
}

@media (max-width: 480px) {
  .logo-subtitle {
    display: none;
  }
}

/* Desktop Navigation */
.luxury-nav-desktop {
  display: none;
}

@media (min-width: 1024px) {
  .luxury-nav-desktop {
    display: block;
    flex: 1;
  }
}

.luxury-nav-list {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 1280px) {
  .luxury-nav-list {
    gap: 2rem;
  }
}

@media (max-width: 1279px) and (min-width: 1024px) {
  .luxury-nav-list {
    gap: 1rem;
  }
}

.luxury-nav-item {
  position: relative;
}

.luxury-nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #f4e7c1;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.5rem 0;
  position: relative;
  transition: all 0.3s ease;
  opacity: 0.9;
  white-space: nowrap;
}

@media (min-width: 1280px) {
  .luxury-nav-link {
    font-size: 0.875rem;
    letter-spacing: 1px;
  }
}

.luxury-nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #d4af37, #b8941f);
  transition: width 0.3s ease;
}

.luxury-header.rtl .luxury-nav-link::after {
  left: auto;
  right: 0;
}

.luxury-nav-link:hover::after,
.luxury-nav-link.active::after {
  width: 100%;
}

.luxury-nav-link:hover,
.luxury-nav-link.active {
  color: #d4af37;
  opacity: 1;
}

/* Navigation Preview */
.nav-preview {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  width: 250px;
  background: rgba(10, 10, 10, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 1rem;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1002;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.luxury-header.rtl .nav-preview {
  left: auto;
  right: 50%;
  transform: translateX(50%) translateY(10px);
}

.luxury-nav-item:hover .nav-preview {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(15px);
}

.luxury-header.rtl .luxury-nav-item:hover .nav-preview {
  transform: translateX(50%) translateY(15px);
}

.preview-content {
  text-align: left;
}

.luxury-header.rtl .preview-content {
  text-align: right;
}

.preview-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #d4af37;
  margin: 0 0 0.25rem 0;
  letter-spacing: 0.5px;
}

.preview-description {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #f4e7c1;
  margin: 0;
  line-height: 1.4;
  opacity: 0.9;
}

/* Header Right Actions */
.luxury-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .luxury-header-right {
    gap: 0.5rem;
  }
}

/* Desktop Section */
.luxury-desktop-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 1023px) {
  .luxury-desktop-section {
    display: none;
  }
}

.luxury-header-toggles {
  display: flex;
  align-items: center;
}

.luxury-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Header Actions */
.luxury-header-action {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 10px;
  color: #f4e7c1;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  flex-shrink: 0;
  text-decoration: none;
}

@media (max-width: 768px) {
  .luxury-header-action {
    width: 36px;
    height: 36px;
  }
}

.luxury-header-action:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: #d4af37;
  color: #d4af37;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
}

/* Wishlist badge */
.wishlist-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  background: #ec4899;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.luxury-header.rtl .wishlist-badge {
  right: auto;
  left: -4px;
}

/* Cart badge */
.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  background: #d4af37;
  color: #0a0a0a;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.luxury-header.rtl .cart-badge {
  right: auto;
  left: -4px;
}

.luxury-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Mobile Actions Row - Only hamburger, cart, wishlist */
.mobile-actions-row {
  display: none;
  align-items: center;
  justify-content: flex-end;
  gap: 0.2rem;
  flex: 1;
}

@media (max-width: 1023px) {
  .mobile-actions-row {
    display: flex;
  }
}

/* Mobile Action Icon Links */
.mobile-action-icon-link {
  position: relative;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 6px;
  color: #f4e7c1;
  text-decoration: none;
  flex-shrink: 0;
}

.mobile-icon {
  width: 15px;
  height: 15px;
  stroke: currentColor;
}

.mobile-wishlist-badge,
.mobile-cart-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 13px;
  height: 13px;
  background: #ec4899;
  color: white;
  font-size: 7px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  padding: 0 2px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-cart-badge {
  background: #d4af37;
  color: #0a0a0a;
}

/* Mobile Toggle */
.luxury-mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  z-index: 1001;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 6px;
  margin-left: auto;
}

@media (max-width: 1023px) {
  .luxury-mobile-toggle {
    display: flex;
  }
}

.luxury-mobile-toggle:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: #d4af37;
}

.mobile-toggle-line {
  width: 15px;
  height: 1.5px;
  background: #f4e7c1;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.luxury-mobile-toggle.open .mobile-toggle-line:nth-child(1) {
  transform: rotate(45deg) translate(3.5px, 3.5px);
}

.luxury-mobile-toggle.open .mobile-toggle-line:nth-child(2) {
  opacity: 0;
}

.luxury-mobile-toggle.open .mobile-toggle-line:nth-child(3) {
  transform: rotate(-45deg) translate(3.5px, -3.5px);
}

/* Mobile Overlay */
.luxury-mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1001;
}

/* Mobile Menu - Half Screen */
.luxury-mobile-menu {
  position: fixed;
  top: 0;
  right: -50%;
  width: 50%;
  max-width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, 
    rgba(10, 10, 10, 0.98) 0%, 
    rgba(26, 18, 11, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(212, 175, 55, 0.15);
  z-index: 1002;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.luxury-header.rtl .luxury-mobile-menu {
  right: auto;
  left: -50%;
  border-left: none;
  border-right: 1px solid rgba(212, 175, 55, 0.15);
}

.luxury-mobile-menu.open {
  right: 0;
}

.luxury-header.rtl .luxury-mobile-menu.open {
  left: 0;
  right: auto;
}

@media (max-width: 768px) {
  .luxury-mobile-menu {
    width: 50%;
    right: -50%;
  }
  
  .luxury-header.rtl .luxury-mobile-menu {
    left: -50%;
  }
}

@media (max-width: 480px) {
  .luxury-mobile-menu {
    width: 70%;
    right: -70%;
  }
  
  .luxury-header.rtl .luxury-mobile-menu {
    left: -70%;
  }
}

.mobile-menu-container {
  height: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  flex-shrink: 0;
}

.mobile-menu-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-logo-icon {
  width: 36px;
  height: 36px;
  position: relative;
  flex-shrink: 0;
}

.mobile-logo-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.mobile-logo-p {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.mobile-logo-text {
  text-align: left;
  min-width: 0;
}

.luxury-header.rtl .mobile-logo-text {
  text-align: right;
}

.mobile-logo-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #d4af37;
  margin: 0;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-logo-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.5rem;
  color: #999999;
  margin: 0.2rem 0 0 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

.mobile-menu-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  color: #f4e7c1;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.mobile-menu-close:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  color: #d4af37;
  transform: rotate(90deg);
}

.mobile-menu-close svg {
  width: 14px;
  height: 14px;
}

.mobile-menu-content {
  flex: 1;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Mobile Navigation */
.mobile-nav {
  flex: 1;
  margin-bottom: 1.5rem;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.mobile-nav-link {
  display: block;
  padding: 0.875rem 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: #f4e7c1;
  text-decoration: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
}

.mobile-nav-link:hover {
  color: #d4af37;
  opacity: 1;
  padding-left: 0.5rem;
}

.luxury-header.rtl .mobile-nav-link:hover {
  padding-left: 0;
  padding-right: 0.5rem;
}

.mobile-nav-link.router-link-active {
  color: #d4af37;
}

/* Mobile Actions */
.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(212, 175, 55, 0.1);
}

.mobile-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 8px;
  color: #f4e7c1;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  width: 100%;
  text-align: left;
  text-decoration: none;
  position: relative;
}

.luxury-header.rtl .mobile-action-btn {
  text-align: right;
}

.mobile-action-btn:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: #d4af37;
  color: #d4af37;
  transform: translateX(4px);
}

.luxury-header.rtl .mobile-action-btn:hover {
  transform: translateX(-4px);
}

.mobile-action-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  fill: none;
  flex-shrink: 0;
}

/* Ensure language toggle inside sidebar looks like other buttons */
.mobile-action-btn :deep(.luxury-language-toggle) {
  width: 100%;
}

.mobile-action-btn :deep(.current-language) {
  background: none;
  border: none;
  color: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0;
  justify-content: flex-start;
}

/* Search Overlay */
.luxury-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1004;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 100px;
}

.search-modal {
  background: linear-gradient(180deg, 
    rgba(10, 10, 10, 0.98) 0%, 
    rgba(26, 18, 11, 0.95) 100%);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 16px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.search-input-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 10px;
  color: #f4e7c1;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  text-align: left;
}

.luxury-header.rtl .search-input {
  text-align: right;
}

.search-input:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.search-close {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a89c7c;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.luxury-header.rtl .search-close {
  right: auto;
  left: 1rem;
}

.search-close:hover {
  color: #d4af37;
}

.search-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

/* No Scroll */
.no-scroll {
  overflow: hidden;
}
</style>
