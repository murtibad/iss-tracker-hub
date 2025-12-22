// src/ui/components/authModal.js
// Login/Signup Modal Component

import { signIn, signUp, signInWithGoogle, resetPassword, onAuthChange, logout, getUser } from '../../services/authService.js';
import { t, getCurrentLanguage } from '../../i18n/i18n.js';
import { ICONS } from '../icons.js';

export function createAuthModal() {
    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

    const modal = document.createElement('div');
    modal.className = 'auth-modal hub-glass';
    modal.style.cssText = `
    width: 100%;
    max-width: 400px;
    border-radius: 16px;
    padding: 24px;
    background: var(--panel);
    border: 1px solid var(--border);
    box-shadow: 0 0 40px var(--neon-glow);
  `;

    let mode = 'login'; // 'login', 'signup', 'reset'

    function render() {
        const lang = getCurrentLanguage();
        const labels = {
            login: lang === 'tr' ? 'Giriş Yap' : 'Sign In',
            signup: lang === 'tr' ? 'Kayıt Ol' : 'Sign Up',
            reset: lang === 'tr' ? 'Şifre Sıfırla' : 'Reset Password',
            email: lang === 'tr' ? 'E-posta' : 'Email',
            password: lang === 'tr' ? 'Şifre' : 'Password',
            name: lang === 'tr' ? 'Ad Soyad' : 'Full Name',
            submit: mode === 'login' ? (lang === 'tr' ? 'Giriş' : 'Login')
                : mode === 'signup' ? (lang === 'tr' ? 'Kayıt Ol' : 'Sign Up')
                    : (lang === 'tr' ? 'Gönder' : 'Send'),
            switchToSignup: lang === 'tr' ? 'Hesabınız yok mu? Kayıt olun' : "Don't have an account? Sign up",
            switchToLogin: lang === 'tr' ? 'Zaten hesabınız var mı? Giriş yapın' : 'Already have an account? Sign in',
            forgotPassword: lang === 'tr' ? 'Şifremi unuttum' : 'Forgot password',
            backToLogin: lang === 'tr' ? '← Giriş ekranına dön' : '← Back to login',
            googleSignIn: lang === 'tr' ? 'Google ile devam et' : 'Continue with Google',
            or: lang === 'tr' ? 'veya' : 'or'
        };

        modal.innerHTML = `
      <div class="auth-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 class="cyber-glitch-text" data-text="${labels[mode]}" style="margin: 0; color: var(--accent); font-size: 20px;">
          ${labels[mode]}
        </h2>
        <button class="auth-close btn" style="font-size: 24px; background: transparent; border: none; color: var(--muted); cursor: pointer;">×</button>
      </div>

      <form class="auth-form" style="display: flex; flex-direction: column; gap: 12px;">
        ${mode === 'signup' ? `
          <input type="text" name="name" placeholder="${labels.name}" 
            style="padding: 12px 16px; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: var(--text); font-size: 14px;"
          />
        ` : ''}
        
        <input type="email" name="email" placeholder="${labels.email}" required
          style="padding: 12px 16px; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: var(--text); font-size: 14px;"
        />
        
        ${mode !== 'reset' ? `
          <input type="password" name="password" placeholder="${labels.password}" required minlength="6"
            style="padding: 12px 16px; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: var(--text); font-size: 14px;"
          />
        ` : ''}
        
        <div class="auth-error" style="color: #ff4444; font-size: 12px; min-height: 18px;"></div>
        
        <button type="submit" class="btn-primary" style="
          padding: 14px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
          color: #000;
          font-weight: bold;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        ">${labels.submit}</button>
      </form>

      ${mode !== 'reset' ? `
        <div style="text-align: center; margin: 16px 0; color: var(--muted); font-size: 12px;">
          ─── ${labels.or} ───
        </div>
        
        <button class="btn-google" style="
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          background: #fff;
          color: #333;
          font-size: 13px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          ${labels.googleSignIn}
        </button>
      ` : ''}

      <div style="margin-top: 16px; text-align: center; font-size: 12px;">
        ${mode === 'login' ? `
          <a href="#" class="auth-switch" data-mode="signup" style="color: var(--accent); text-decoration: none;">
            ${labels.switchToSignup}
          </a>
          <br><br>
          <a href="#" class="auth-switch" data-mode="reset" style="color: var(--muted); text-decoration: none;">
            ${labels.forgotPassword}
          </a>
        ` : mode === 'signup' ? `
          <a href="#" class="auth-switch" data-mode="login" style="color: var(--accent); text-decoration: none;">
            ${labels.switchToLogin}
          </a>
        ` : `
          <a href="#" class="auth-switch" data-mode="login" style="color: var(--accent); text-decoration: none;">
            ${labels.backToLogin}
          </a>
        `}
      </div>
    `;

        // Event bindings
        modal.querySelector('.auth-close').onclick = close;

        modal.querySelectorAll('.auth-switch').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                mode = link.dataset.mode;
                render();
            };
        });

        const form = modal.querySelector('.auth-form');
        const errorEl = modal.querySelector('.auth-error');

        form.onsubmit = async (e) => {
            e.preventDefault();
            errorEl.textContent = '';

            const email = form.email.value.trim();
            const password = form.password?.value || '';
            const name = form.name?.value?.trim() || null;

            let result;

            if (mode === 'login') {
                result = await signIn(email, password);
            } else if (mode === 'signup') {
                result = await signUp(email, password, name);
            } else if (mode === 'reset') {
                result = await resetPassword(email);
                if (result.success) {
                    errorEl.style.color = '#00ff00';
                    errorEl.textContent = getCurrentLanguage() === 'tr'
                        ? 'Şifre sıfırlama e-postası gönderildi'
                        : 'Password reset email sent';
                    return;
                }
            }

            if (result.success) {
                close();
            } else {
                errorEl.textContent = result.error;
            }
        };

        const googleBtn = modal.querySelector('.btn-google');
        if (googleBtn) {
            googleBtn.onclick = async () => {
                errorEl.textContent = '';
                const result = await signInWithGoogle();
                if (result.success) {
                    close();
                } else {
                    errorEl.textContent = result.error;
                }
            };
        }
    }

    function open(initialMode = 'login') {
        mode = initialMode;
        render();
        overlay.style.display = 'flex';
    }

    function close() {
        overlay.style.display = 'none';
    }

    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };

    overlay.appendChild(modal);

    return {
        el: overlay,
        open,
        close
    };
}

// User profile button for navbar
export function createUserButton() {
    const container = document.createElement('div');
    container.className = 'user-button-container';
    container.style.cssText = 'position: relative;';

    const btn = document.createElement('button');
    btn.className = 'btn user-btn';
    btn.style.cssText = `
    font-size: 14px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    cursor: pointer;
  `;

    function render(user) {
        if (user) {
            const name = user.displayName || user.email.split('@')[0];
            btn.innerHTML = `
        <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #000; font-weight: bold;">
          ${name.charAt(0).toUpperCase()}
        </span>
        <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
      `;
        } else {
            const lang = getCurrentLanguage();
            btn.innerHTML = `
        ${ICONS.user || '👤'}
        <span>${lang === 'tr' ? 'Giriş' : 'Login'}</span>
      `;
        }
    }

    // Listen for auth changes
    onAuthChange(render);

    container.appendChild(btn);

    return {
        el: container,
        button: btn
    };
}
