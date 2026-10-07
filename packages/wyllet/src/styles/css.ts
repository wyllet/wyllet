// Wyllet base stylesheet. Every value comes from a `--wy-*` token set by the theme,
// so restyling never requires editing this file. Class names are stable and prefixed `wy-`.
export const css = /* css */ `
[data-wyllet]{
  --wy-ease: cubic-bezier(.2,.9,.25,1);
  --wy-spring: cubic-bezier(.3,1.5,.55,1);
  --wy-accent-soft: color-mix(in srgb, var(--wy-colors-accent) 13%, transparent);
  --wy-accent-line: color-mix(in srgb, var(--wy-colors-accent) 55%, transparent);
  --wy-glow-color: color-mix(in srgb, var(--wy-colors-accent) calc(var(--wy-effects-glow) * 100%), transparent);
  --wy-brand-gradient: linear-gradient(120deg, var(--wy-colors-accent), var(--wy-colors-accent-secondary));
  font-family: var(--wy-fonts-body);
  color: var(--wy-colors-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.4;
  font-feature-settings: "cv11", "ss01";
}
[data-wyllet] *,[data-wyllet] *::before,[data-wyllet] *::after{box-sizing:border-box}
[data-wyllet] :where(h1,h2,h3,h4,p,ul,ol,li){margin:0;padding:0;list-style:none}
[data-wyllet] :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;text-align:inherit}
[data-wyllet] :where(button:disabled){cursor:default}
[data-wyllet] :where(a){color:inherit;text-decoration:none}
[data-wyllet] :where(img){display:block;max-width:none}
[data-wyllet] :where(code,kbd){font-family:var(--wy-fonts-mono)}
[data-wyllet] :where(button,a,input):focus-visible{outline:2px solid var(--wy-accent-line);outline-offset:2px}
.wy-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.wy-dim{opacity:.5;flex:none}
.wy-center{text-align:center}
.wy-spinner{animation:wy-spin .75s linear infinite;flex:none}

/* ================================================================ Island button */
.wy-island{
  --wy-h:42px;
  position:relative;display:inline-flex;align-items:center;gap:9px;height:var(--wy-h);padding:0 14px 0 6px;
  border-radius:var(--wy-radii-button);font-family:var(--wy-fonts-body);font-size:14.5px;font-weight:600;letter-spacing:-.01em;
  background:var(--wy-colors-island-background);color:var(--wy-colors-island-text);box-shadow:var(--wy-shadows-island);
  backdrop-filter:var(--wy-effects-panel-blur);-webkit-backdrop-filter:var(--wy-effects-panel-blur);
  transition:transform .25s var(--wy-spring), box-shadow .25s var(--wy-ease), background .2s;
  white-space:nowrap;isolation:isolate;
}
.wy-island-sm{--wy-h:34px;font-size:13px;gap:7px}
.wy-island-lg{--wy-h:50px;font-size:16px;padding-right:18px;gap:11px}
.wy-island:hover{transform:translateY(-1px);box-shadow:var(--wy-shadows-island), 0 0 0 4px var(--wy-accent-soft)}
.wy-island:active{transform:scale(.97)}
.wy-island-cta{padding:0 8px 0 6px;background:var(--wy-colors-accent);color:var(--wy-colors-accent-foreground);box-shadow:0 0 0 1px color-mix(in srgb, var(--wy-colors-accent) 60%, #000), 0 10px 28px -10px var(--wy-glow-color), inset 0 1px 0 rgba(255,255,255,.25)}
.wy-island-cta:hover{box-shadow:0 0 0 1px color-mix(in srgb, var(--wy-colors-accent) 60%, #000), 0 14px 34px -10px var(--wy-glow-color), 0 0 0 5px var(--wy-accent-soft)}
.wy-island-cta > span:nth-child(2){padding-right:6px}
.wy-island-cta-icon{width:calc(var(--wy-h) - 12px);height:calc(var(--wy-h) - 12px);display:grid;place-items:center;border-radius:calc(var(--wy-radii-button) - 4px);background:rgba(0,0,0,.14)}
.wy-island-kbd{font-family:var(--wy-fonts-mono);font-size:11px;font-weight:500;padding:3px 6px;border-radius:var(--wy-radii-badge);background:rgba(0,0,0,.14);opacity:.85}
.wy-island-avatar{position:relative;display:inline-flex;flex:none}
.wy-island-chain{position:absolute;right:-4px;bottom:-3px;display:grid;place-items:center;width:15px;height:15px;border-radius:99px;background:var(--wy-colors-island-background);box-shadow:0 0 0 1.5px var(--wy-colors-island-background)}
.wy-island-name{font-variant-numeric:tabular-nums}
.wy-island-balance{display:inline-flex;align-items:baseline;gap:4px;padding-left:10px;margin-left:1px;border-left:1px solid var(--wy-colors-border);font-family:var(--wy-fonts-mono);font-size:.88em;font-weight:500;color:var(--wy-colors-text-secondary)}
.wy-island-balance small{font-size:.82em;opacity:.7}
.wy-island-status{width:7px;height:7px;border-radius:99px;background:var(--wy-colors-success);box-shadow:0 0 0 3px color-mix(in srgb, var(--wy-colors-success) 22%, transparent);flex:none;margin-left:2px}
.wy-island-status.wy-pending{background:var(--wy-colors-warning);box-shadow:0 0 0 3px color-mix(in srgb, var(--wy-colors-warning) 22%, transparent);animation:wy-blink 1.4s ease-in-out infinite}
.wy-island-warn{box-shadow:0 0 0 1.5px var(--wy-colors-danger), 0 8px 24px -10px color-mix(in srgb, var(--wy-colors-danger) 60%, transparent)}
.wy-island-warn .wy-island-name{color:var(--wy-colors-danger)}
.wy-island-warn .wy-island-status{background:var(--wy-colors-danger);box-shadow:0 0 0 3px color-mix(in srgb, var(--wy-colors-danger) 22%, transparent)}
.wy-island-warn .wy-island-chain{background:var(--wy-colors-danger);color:#fff}
@media (max-width:640px){.wy-island-balance{display:none}}

/* ================================================================ Avatar / icons */
.wy-avatar{display:inline-block;flex:none;border-radius:999px;overflow:hidden;position:relative;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
.wy-avatar img{width:100%;height:100%;object-fit:cover}
.wy-chain-icon{flex:none;object-fit:contain}
.wy-wallet-icon{display:inline-flex;flex:none;border-radius:var(--wy-radii-icon);overflow:hidden;box-shadow:0 0 0 1px var(--wy-colors-border)}
.wy-wallet-icon img{width:100%;height:100%;object-fit:cover}
.wy-token-icon{position:relative;display:inline-flex;flex:none}
.wy-token-icon > img{width:100%;height:100%;object-fit:contain}
.wy-token-chain{position:absolute;right:-3px;bottom:-3px;display:flex;border-radius:99px;box-shadow:0 0 0 2px var(--wy-colors-background)}
.wy-kbd{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:var(--wy-radii-badge);font-size:11px;font-weight:500;color:var(--wy-colors-text-tertiary);background:var(--wy-colors-surface);box-shadow:inset 0 -1px 0 var(--wy-colors-border), 0 0 0 1px var(--wy-colors-border);flex:none}

/* ================================================================ Layer + surface */
.wy-layer{position:fixed;inset:0;z-index:2147483000;pointer-events:none}
.wy-overlay{position:absolute;inset:0;pointer-events:auto;background:var(--wy-colors-overlay);backdrop-filter:var(--wy-effects-overlay-blur);-webkit-backdrop-filter:var(--wy-effects-overlay-blur);animation:wy-fade .3s var(--wy-ease) both}
.wy-layer[data-state=closed] .wy-overlay{animation:wy-fade-out .24s var(--wy-ease) both}
.wy-surface{
  position:absolute;pointer-events:auto;display:flex;flex-direction:column;outline:none;overflow:hidden;
  background:var(--wy-colors-background);border-radius:var(--wy-radii-panel);box-shadow:var(--wy-shadows-panel);
  backdrop-filter:var(--wy-effects-panel-blur);-webkit-backdrop-filter:var(--wy-effects-panel-blur);
  overflow:clip; /* focus can never scroll the shell; only .wy-scroll areas scroll */
}
.wy-surface-glow{position:absolute;inset:0 0 auto;height:180px;pointer-events:none;z-index:0;opacity:calc(var(--wy-effects-glow) * 1.4);
  background:radial-gradient(60% 100% at 50% -30%, var(--wy-colors-accent), transparent 70%);mix-blend-mode:screen;filter:blur(10px)}
.wy-surface > *:not(.wy-surface-glow){position:relative;z-index:1}
.wy-surface-fill{display:flex;flex-direction:column;flex:1;min-height:0}
.wy-animated-height{transition:height .38s var(--wy-ease);overflow:hidden;overflow:clip}
.wy-animated-height > div{display:flex;flex-direction:column}

/* drawer: floating full-height side panel */
.wy-mode-drawer .wy-surface{top:10px;bottom:10px;width:min(420px, calc(100vw - 20px));animation:wy-drawer-in-r .5s var(--wy-ease) both}
.wy-mode-drawer.wy-side-right .wy-surface{right:10px}
.wy-mode-drawer.wy-side-left .wy-surface{left:10px;animation-name:wy-drawer-in-l}
.wy-mode-drawer[data-state=closed].wy-side-right .wy-surface{animation:wy-drawer-out-r .26s var(--wy-ease) both}
.wy-mode-drawer[data-state=closed].wy-side-left .wy-surface{animation:wy-drawer-out-l .26s var(--wy-ease) both}
.wy-mode-drawer .wy-body{flex:1;min-height:0}
.wy-mode-drawer .wy-scroll-inner > .wy-step{margin-block:auto;padding-bottom:48px}

/* popover: anchored dropdown */
.wy-mode-popover .wy-overlay{background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none}
.wy-mode-popover .wy-surface{width:392px;animation:wy-pop .34s var(--wy-spring) both}
.wy-mode-popover[data-state=closed] .wy-surface{animation:wy-pop-out .18s var(--wy-ease) both}
.wy-mode-popover .wy-body{max-height:min(520px, calc(var(--wy-avail, 100dvh) - 190px))}
.wy-mode-modal .wy-body{max-height:min(540px, calc(100dvh - 240px))}
/* account: identity + actions + tabs stay fixed, only the tab content scrolls */
.wy-mode-popover .wy-body.wy-account-scroll{max-height:min(340px, calc(var(--wy-avail, 100dvh) - 336px))}
.wy-mode-modal .wy-body.wy-account-scroll{max-height:min(360px, calc(100dvh - 386px))}
.wy-mode-sheet .wy-body.wy-account-scroll{max-height:calc(92dvh - 346px)}
.wy-mode-popover .wy-body.wy-account-scroll.wy-with-card{max-height:max(150px, min(300px, calc(var(--wy-avail, 100dvh) - 516px)))}
.wy-mode-modal .wy-body.wy-account-scroll.wy-with-card{max-height:max(150px, min(320px, calc(100dvh - 566px)))}
.wy-mode-sheet .wy-body.wy-account-scroll.wy-with-card{max-height:max(150px, calc(92dvh - 526px))}

/* modal: centered */
.wy-mode-modal .wy-surface{left:50%;top:50%;width:min(400px, calc(100vw - 24px));max-height:calc(100dvh - 32px);translate:-50% -50%;animation:wy-pop .4s var(--wy-spring) both}
.wy-mode-modal[data-state=closed] .wy-surface{animation:wy-pop-out .2s var(--wy-ease) both}

/* sheet: phones */
.wy-mode-sheet .wy-surface{left:0;right:0;bottom:0;max-height:92dvh;border-bottom-left-radius:0;border-bottom-right-radius:0;padding-bottom:env(safe-area-inset-bottom);animation:wy-sheet-in .46s var(--wy-ease) both;transition:transform .3s var(--wy-ease)}
.wy-mode-sheet[data-state=closed] .wy-surface{animation:wy-sheet-out .26s var(--wy-ease) both}
.wy-mode-sheet .wy-body{max-height:calc(92dvh - 120px)}
.wy-sheet-handle{position:absolute;top:0;left:0;right:0;height:24px;z-index:3!important;cursor:grab;touch-action:none}
.wy-sheet-handle::after{content:"";position:absolute;top:8px;left:50%;width:38px;height:4px;margin-left:-19px;border-radius:9px;background:var(--wy-colors-text-tertiary);opacity:.6}

/* ================================================================ Header / body / footer */
.wy-head{display:flex;align-items:center;gap:10px;min-height:60px;padding:14px 14px 8px 16px}
.wy-head-title{flex:1;min-width:0;font-size:15.5px;font-weight:650;letter-spacing:-.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-head-close{margin-left:auto}
.wy-icon-btn{width:32px;height:32px;flex:none;display:inline-grid;place-items:center;border-radius:calc(var(--wy-radii-button) - 2px);color:var(--wy-colors-text-secondary);background:var(--wy-colors-surface);transition:background .15s,color .15s,transform .2s var(--wy-spring)}
.wy-icon-btn:hover{background:var(--wy-colors-surface-hover);color:var(--wy-colors-text)}
.wy-icon-btn:active{transform:scale(.88)}
.wy-icon-btn-sm{width:26px;height:26px}
.wy-app-mark{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:calc(var(--wy-radii-icon) - 2px);background:var(--wy-brand-gradient);color:var(--wy-colors-accent-foreground);font-weight:800;font-size:14px;overflow:hidden}
.wy-app-mark img{width:100%;height:100%;object-fit:contain}
.wy-app-mark:has(img){background:none;overflow:visible}
.wy-body{padding:6px 14px 14px}
.wy-scroll{position:relative;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch}
.wy-scroll::-webkit-scrollbar{display:none}
.wy-scroll-inner{display:flex;flex-direction:column;min-height:100%}
.wy-scroll[data-fade-top=true]{-webkit-mask-image:linear-gradient(transparent,#000 28px);mask-image:linear-gradient(transparent,#000 28px)}
.wy-scroll[data-fade-bottom=true]{-webkit-mask-image:linear-gradient(#000 calc(100% - 28px),transparent);mask-image:linear-gradient(#000 calc(100% - 28px),transparent)}
.wy-scroll[data-fade-top=true][data-fade-bottom=true]{-webkit-mask-image:linear-gradient(transparent,#000 28px,#000 calc(100% - 28px),transparent);mask-image:linear-gradient(transparent,#000 28px,#000 calc(100% - 28px),transparent)}
.wy-section-label{font-family:var(--wy-fonts-mono);font-size:10.5px;font-weight:500;text-transform:uppercase;letter-spacing:.12em;color:var(--wy-colors-text-tertiary);padding:16px 4px 8px}
.wy-left{align-self:stretch;text-align:left}
.wy-hint{font-size:12.5px;color:var(--wy-colors-text-tertiary)}
.wy-empty{padding:28px 0;text-align:center;font-size:14px;color:var(--wy-colors-text-secondary)}
.wy-empty-sm{padding:14px 4px;font-size:13px;color:var(--wy-colors-text-tertiary)}
.wy-text-btn{font-family:var(--wy-fonts-mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--wy-colors-text-tertiary)}
.wy-text-btn:hover{color:var(--wy-colors-text)}

.wy-foot{padding:12px 14px 14px;border-top:1px solid var(--wy-colors-border);display:flex;flex-direction:column;gap:10px}
.wy-foot-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:8px}
.wy-foot-btn{display:flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 10px;border-radius:var(--wy-radii-button);font-size:13px;font-weight:600;color:var(--wy-colors-text-secondary);background:var(--wy-colors-surface);transition:background .15s,color .15s}
.wy-foot-btn:hover{background:var(--wy-colors-surface-hover);color:var(--wy-colors-text)}
.wy-disclaimer{font-size:11.5px;color:var(--wy-colors-text-tertiary);text-align:center}
.wy-disclaimer a{color:var(--wy-colors-text-secondary);text-decoration:underline;text-underline-offset:2px}
.wy-brand{display:flex;align-items:center;justify-content:center;gap:6px;font-family:var(--wy-fonts-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--wy-colors-text-tertiary);user-select:none}
.wy-brand strong{font-family:var(--wy-fonts-body);font-size:12.5px;font-weight:700;letter-spacing:-.02em;text-transform:none;color:var(--wy-colors-text-secondary)}
.wy-brand-mark{flex:none;transition:transform .5s var(--wy-spring)}
.wy-brand:hover .wy-brand-mark{transform:rotate(-12deg) scale(1.15)}
.wy-account-foot{padding:10px 14px 12px;border-top:1px solid var(--wy-colors-border)}

/* ================================================================ Buttons */
.wy-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;width:100%;border-radius:var(--wy-radii-button);font-size:14.5px;font-weight:600;letter-spacing:-.01em;transition:transform .2s var(--wy-spring),background .15s,filter .15s,opacity .15s,box-shadow .2s}
.wy-btn:active:not(:disabled){transform:scale(.97)}
.wy-btn:disabled{opacity:.55}
.wy-btn-primary{background:var(--wy-colors-accent);color:var(--wy-colors-accent-foreground);box-shadow:inset 0 1px 0 rgba(255,255,255,.22), 0 10px 26px -12px var(--wy-glow-color)}
.wy-btn-primary:hover:not(:disabled){filter:brightness(1.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.22), 0 12px 30px -10px var(--wy-glow-color)}
.wy-btn-secondary{background:var(--wy-colors-surface);color:var(--wy-colors-text);box-shadow:inset 0 0 0 1px var(--wy-colors-border)}
.wy-btn-secondary:hover:not(:disabled){background:var(--wy-colors-surface-hover)}
.wy-btn-ghost{color:var(--wy-colors-text-secondary);min-height:38px;width:auto}
.wy-btn-ghost:hover:not(:disabled){color:var(--wy-colors-text)}

/* ================================================================ Wallet picker */
.wy-picker{display:flex;flex-direction:column}
.wy-continue{
  position:relative;display:flex;align-items:center;gap:13px;padding:12px;margin-top:2px;border-radius:var(--wy-radii-card);
  background:linear-gradient(var(--wy-colors-surface),var(--wy-colors-surface)) padding-box, var(--wy-brand-gradient) border-box;border:1px solid transparent;
  transition:transform .25s var(--wy-spring), box-shadow .25s;animation:wy-rise .45s var(--wy-ease) both;
}
.wy-continue:hover,.wy-continue.wy-row-active{box-shadow:0 12px 32px -14px var(--wy-glow-color)}
.wy-continue:active{transform:scale(.985)}
.wy-continue-kicker{font-family:var(--wy-fonts-mono);font-size:10.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--wy-colors-accent)}
.wy-continue-arrow{width:32px;height:32px;display:grid;place-items:center;border-radius:99px;background:var(--wy-colors-accent);color:var(--wy-colors-accent-foreground);transition:transform .3s var(--wy-spring)}
.wy-continue:hover .wy-continue-arrow{transform:translateX(3px)}
.wy-search{display:flex;align-items:center;gap:9px;height:42px;padding:0 10px 0 12px;margin-top:12px;border-radius:var(--wy-radii-button);background:var(--wy-colors-surface);color:var(--wy-colors-text-tertiary);box-shadow:inset 0 0 0 1px var(--wy-colors-border);transition:box-shadow .2s}
.wy-search:focus-within{box-shadow:inset 0 0 0 1px var(--wy-accent-line), 0 0 0 4px var(--wy-accent-soft)}
.wy-search input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:inherit;font-size:14px;color:var(--wy-colors-text)}
.wy-search input:focus-visible{outline:none}
.wy-search input::placeholder{color:var(--wy-colors-text-tertiary)}
.wy-search input::-webkit-search-cancel-button{display:none}
.wy-search-hint{display:flex;gap:3px}
.wy-rows{display:flex;flex-direction:column;gap:2px}
.wy-row{
  position:relative;display:flex;align-items:center;gap:12px;width:100%;padding:8px 10px 8px 8px;border-radius:var(--wy-radii-card);
  transition:background .12s;animation:wy-rise .4s var(--wy-ease) both;animation-delay:calc(var(--i, 0) * 28ms);
}
.wy-row::before{content:"";position:absolute;left:-1px;top:50%;width:3px;height:0;border-radius:0 3px 3px 0;background:var(--wy-colors-accent);transform:translateY(-50%);transition:height .2s var(--wy-ease)}
.wy-row-active{background:var(--wy-colors-surface)}
.wy-row-active::before{height:22px}
.wy-row:active{background:var(--wy-colors-surface-active)}
.wy-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.wy-row-title{font-size:14.5px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-row-sub{font-size:12px;color:var(--wy-colors-text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-live{display:inline-flex;align-items:center;gap:6px;font-family:var(--wy-fonts-mono);font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--wy-colors-success)}
.wy-live i,.wy-live-dot{width:6px;height:6px;border-radius:9px;background:currentColor;box-shadow:0 0 0 3px color-mix(in srgb, currentColor 22%, transparent);animation:wy-blink 2s ease-in-out infinite}
.wy-live-dot{color:var(--wy-colors-success)}

/* ================================================================ Steps */
.wy-step{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:18px 6px 6px}
.wy-enter{animation:wy-slide .38s var(--wy-ease) both}
.wy-step-label{font-size:18px;font-weight:700;letter-spacing:-.02em;margin-top:8px}
.wy-step-body{font-size:14px;line-height:1.55;color:var(--wy-colors-text-secondary);max-width:310px}
.wy-step-actions{display:flex;flex-direction:column;gap:8px;width:100%;margin-top:12px}
.wy-step-actions.wy-inline{flex-direction:row}
.wy-step-actions.wy-inline .wy-btn{flex:1}

.wy-orbit{position:relative;width:118px;height:118px;display:grid;place-items:center;margin-top:6px}
.wy-orbit .wy-wallet-icon{border-radius:22px;box-shadow:0 0 0 1px var(--wy-colors-border), 0 14px 30px -12px rgba(0,0,0,.5)}
.wy-orbit-ring{position:absolute;inset:0;border-radius:36px;padding:2px;background:conic-gradient(from 0deg, transparent 0 55%, var(--wy-colors-accent-secondary) 75%, var(--wy-colors-accent) 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:wy-spin 1.4s linear infinite}
.wy-orbit-ring-2{inset:-10px;border-radius:44px;opacity:.35;animation-duration:2.6s;animation-direction:reverse}
.wy-orbit-error .wy-orbit-ring{background:var(--wy-colors-danger);animation:none;opacity:.6}
.wy-orbit-error .wy-orbit-ring-2{display:none}
.wy-orbit-badge{position:absolute;right:16px;bottom:16px;width:26px;height:26px;border-radius:99px;display:grid;place-items:center;background:var(--wy-colors-danger);color:#fff;box-shadow:0 0 0 4px var(--wy-colors-background);animation:wy-pop .4s var(--wy-spring) both}
.wy-dots{display:flex;gap:6px}
.wy-dots i{width:6px;height:6px;border-radius:9px;background:var(--wy-colors-accent);animation:wy-bounce 1.2s ease-in-out infinite}
.wy-dots i:nth-child(2){animation-delay:.15s}.wy-dots i:nth-child(3){animation-delay:.3s}

.wy-qr-frame{padding:2px;border-radius:calc(var(--wy-radii-card) + 8px);background:var(--wy-brand-gradient);box-shadow:0 20px 50px -24px var(--wy-glow-color)}
.wy-qr-inner{padding:8px;border-radius:calc(var(--wy-radii-card) + 6px);background:var(--wy-colors-qr-background);color:var(--wy-colors-qr-foreground)}
.wy-qr-svg{display:block;width:min(256px, 66vw);height:auto;animation:wy-qr-in .55s var(--wy-ease) both}
.wy-qr-skeleton{width:min(256px, 66vw);aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font-size:12.5px;color:#777;border-radius:var(--wy-radii-card);
  background:repeating-linear-gradient(45deg, rgba(0,0,0,.035) 0 8px, transparent 8px 16px)}
.wy-qr-skeleton .wy-btn{width:auto}

.wy-link-cards{display:flex;flex-direction:column;gap:8px;width:100%;margin-top:10px}
.wy-link-card{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:var(--wy-radii-card);background:var(--wy-colors-surface);box-shadow:inset 0 0 0 1px var(--wy-colors-border);text-align:left;color:var(--wy-colors-text-secondary);transition:background .15s, transform .2s var(--wy-spring)}
.wy-link-card:hover{background:var(--wy-colors-surface-hover);color:var(--wy-colors-text)}
.wy-link-card:active{transform:scale(.985)}
.wy-link-card span{display:flex;flex-direction:column}
.wy-link-card strong{font-size:14px;color:var(--wy-colors-text)}
.wy-link-card small{font-family:var(--wy-fonts-mono);font-size:11px;color:var(--wy-colors-text-tertiary)}

.wy-onboard-art{display:flex;margin:6px 0 4px}
.wy-onboard-art > span{margin-left:-14px;transform:rotate(calc((var(--i) - 1) * 9deg)) translateY(calc(var(--i) * 0px));animation:wy-fan .6s var(--wy-spring) both;animation-delay:calc(var(--i) * 70ms)}
.wy-onboard-art > span:first-child{margin-left:0}
.wy-onboard-art .wy-wallet-icon{box-shadow:0 0 0 3px var(--wy-colors-background), 0 10px 24px -10px rgba(0,0,0,.5)}
.wy-step .wy-rows{width:100%;text-align:left}

.wy-sign-stack{display:flex;align-items:center;margin-top:6px}
.wy-sign-shield{width:56px;height:56px;margin-left:-14px;border-radius:99px;display:grid;place-items:center;background:var(--wy-colors-accent);color:var(--wy-colors-accent-foreground);box-shadow:0 0 0 4px var(--wy-colors-background);overflow:hidden}
.wy-sign-shield img{width:78%;height:78%;object-fit:contain}
.wy-sign-shield:has(img){background:var(--wy-colors-surface)}
.wy-sign-stack .wy-avatar{box-shadow:0 0 0 4px var(--wy-colors-background)}
.wy-address-chip{font-size:12px;padding:6px 10px;border-radius:var(--wy-radii-badge);background:var(--wy-colors-surface);color:var(--wy-colors-text-secondary)}

.wy-success{position:relative;width:110px;height:110px;display:grid;place-items:center;margin-top:8px}
.wy-success-core{position:relative;width:72px;height:72px;border-radius:99px;display:grid;place-items:center;background:var(--wy-colors-accent);color:var(--wy-colors-accent-foreground);box-shadow:0 14px 40px -12px var(--wy-glow-color);animation:wy-pop .5s var(--wy-spring) both}
.wy-success-check{stroke-dasharray:24;stroke-dashoffset:24;animation:wy-draw .45s .2s var(--wy-ease) forwards}
.wy-success-ripple{position:absolute;inset:18px;border-radius:99px;border:2px solid var(--wy-colors-accent);animation:wy-ripple 1.2s var(--wy-ease) both}
.wy-success-ripple-2{animation-delay:.18s}

/* ================================================================ Account */
.wy-chain-chip{display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 9px 0 7px;border-radius:99px;font-size:13px;font-weight:600;background:var(--wy-colors-surface);box-shadow:inset 0 0 0 1px var(--wy-colors-border);transition:background .15s}
.wy-chain-chip:hover{background:var(--wy-colors-surface-hover)}
.wy-chain-chip-bad{color:var(--wy-colors-danger);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--wy-colors-danger) 45%, transparent)}

.wy-account-top{display:flex;flex-direction:column;gap:14px;padding:4px 14px 10px}
.wy-summary{display:flex;align-items:center;gap:14px;padding:2px 2px 0;animation:wy-rise .4s var(--wy-ease) both}
.wy-summary-main{min-width:0;display:flex;flex-direction:column;gap:2px}
.wy-summary-name{display:inline-flex;align-items:center;gap:7px;max-width:100%;font-size:15px;font-weight:650;letter-spacing:-.01em;color:var(--wy-colors-text-secondary);transition:color .15s}
.wy-summary-name > span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-summary-name:hover{color:var(--wy-colors-text)}
.wy-summary-copy{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;color:var(--wy-colors-text-tertiary);background:var(--wy-colors-surface);transition:color .15s,background .15s}
.wy-summary-name:hover .wy-summary-copy{color:var(--wy-colors-text)}
.wy-summary-copy.wy-copied{color:var(--wy-colors-success)}
.wy-summary-balance{display:flex;align-items:baseline;gap:6px;font-size:26px;font-weight:700;letter-spacing:-.035em;line-height:1.1;font-variant-numeric:tabular-nums}
.wy-summary-balance small{font-size:14px;font-weight:600;letter-spacing:0;color:var(--wy-colors-text-tertiary)}
.wy-quick-actions{display:flex;gap:6px}
.wy-quick-action{flex:1;min-width:0;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 8px;border-radius:var(--wy-radii-button);font-size:13px;font-weight:600;white-space:nowrap;
  color:var(--wy-colors-text-secondary);background:var(--wy-colors-surface);box-shadow:inset 0 0 0 1px var(--wy-colors-border);transition:background .15s,color .15s,transform .2s var(--wy-spring)}
.wy-quick-action:hover{background:var(--wy-colors-surface-hover);color:var(--wy-colors-text)}
.wy-quick-action:active{transform:scale(.96)}
.wy-quick-danger{flex:0 0 38px;padding:0}
.wy-quick-danger:hover{color:var(--wy-colors-danger);background:color-mix(in srgb, var(--wy-colors-danger) 10%, var(--wy-colors-surface))}
.wy-account-scroll{padding-top:4px}
.wy-card-stage{perspective:900px;animation:wy-rise .5s var(--wy-ease) both}
.wy-card{
  --rx:0deg;--ry:0deg;--mx:30%;--my:20%;
  position:relative;aspect-ratio:1.75;border-radius:calc(var(--wy-radii-card) + 4px);padding:16px 18px;overflow:hidden;color:#fff;
  display:flex;flex-direction:column;justify-content:space-between;
  background:
    radial-gradient(120% 90% at 100% 0%, hsl(var(--h3) 90% 60% / .55), transparent 55%),
    radial-gradient(90% 90% at 0% 100%, hsl(var(--h2) 85% 45% / .9), transparent 60%),
    linear-gradient(140deg, hsl(var(--h1) 75% 42%), hsl(var(--h2) 70% 26%) 60%, hsl(var(--h3) 60% 14%));
  box-shadow:0 0 0 1px rgba(255,255,255,.12) inset, 0 24px 50px -22px hsl(var(--h1) 80% 30% / .9), 0 8px 18px -10px rgba(0,0,0,.5);
  transform:rotateX(var(--rx)) rotateY(var(--ry));transform-style:preserve-3d;transition:transform .5s var(--wy-ease);
}
.wy-card:hover{transition:transform .08s linear}
.wy-card-pattern{position:absolute;inset:0;opacity:.18;pointer-events:none;
  background:repeating-linear-gradient(115deg, rgba(255,255,255,.5) 0 1px, transparent 1px 9px);
  -webkit-mask:radial-gradient(80% 80% at 80% 20%, #000, transparent 70%);mask:radial-gradient(80% 80% at 80% 20%, #000, transparent 70%)}
.wy-card-sheen{position:absolute;inset:-40%;pointer-events:none;mix-blend-mode:overlay;opacity:.8;
  background:radial-gradient(30% 30% at var(--mx) var(--my), rgba(255,255,255,.75), transparent 70%),
             conic-gradient(from 210deg at var(--mx) var(--my), transparent, rgba(255,255,255,.14), transparent 30%)}
.wy-card-top,.wy-card-bottom{position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.wy-card-bottom{align-items:flex-end}
.wy-card-avatar{box-shadow:0 0 0 2px rgba(255,255,255,.35)}
.wy-card-chain{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px 0 5px;border-radius:99px;font-size:11.5px;font-weight:600;background:rgba(0,0,0,.25);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.wy-card-balance{font-size:27px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.15}
.wy-card-balance small{font-size:13px;font-weight:600;opacity:.75;letter-spacing:0}
.wy-card-id{text-align:right;min-width:0}
.wy-card-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-card-address{font-family:var(--wy-fonts-mono);font-size:12.5px;font-weight:500;opacity:.85;letter-spacing:.02em}
.wy-card-name + .wy-card-address{font-size:11px;font-weight:400;opacity:.7}
.wy-tabs{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);padding:3px;border-radius:var(--wy-radii-button);background:var(--wy-colors-surface);box-shadow:inset 0 0 0 1px var(--wy-colors-border)}
.wy-tabs button{position:relative;z-index:1;height:32px;font-size:13px;font-weight:600;color:var(--wy-colors-text-tertiary);transition:color .2s;text-align:center}
.wy-tabs button.wy-on{color:var(--wy-colors-text)}
.wy-tabs-indicator{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / var(--n));border-radius:calc(var(--wy-radii-button) - 3px);background:var(--wy-colors-background);box-shadow:0 1px 3px rgba(0,0,0,.2), 0 0 0 1px var(--wy-colors-border);transform:translateX(calc(var(--x) * 100%));transition:transform .4s var(--wy-spring)}
.wy-tab-panel{animation:wy-fade .3s var(--wy-ease) both;min-height:120px}

.wy-list{display:flex;flex-direction:column;gap:2px}
.wy-token-row{display:flex;align-items:center;gap:12px;padding:9px 8px;border-radius:var(--wy-radii-card);transition:background .12s}
.wy-token-row:hover{background:var(--wy-colors-surface)}
.wy-enter-row{animation:wy-rise .4s var(--wy-ease) both;animation-delay:calc(var(--i, 0) * 35ms)}
.wy-zero{opacity:.45}
.wy-amount{font-family:var(--wy-fonts-mono);font-size:13.5px;font-weight:500;font-variant-numeric:tabular-nums}
.wy-skeleton-row{height:50px;border-radius:var(--wy-radii-card);background:linear-gradient(90deg, var(--wy-colors-surface) 25%, var(--wy-colors-surface-hover) 50%, var(--wy-colors-surface) 75%);background-size:200% 100%;animation:wy-shimmer 1.3s linear infinite}

.wy-timeline{position:relative}
.wy-timeline-clear{position:absolute;right:4px;top:14px}
.wy-timeline ol{position:relative}
.wy-timeline ol::before{content:"";position:absolute;left:23px;top:14px;bottom:14px;width:1px;background:linear-gradient(var(--wy-colors-border), transparent)}
.wy-event{position:relative;display:flex;align-items:center;gap:12px;padding:8px 8px;border-radius:var(--wy-radii-card);animation:wy-rise .4s var(--wy-ease) both;animation-delay:calc(var(--i, 0) * 35ms)}
.wy-event:hover{background:var(--wy-colors-surface)}
.wy-event-icon{position:relative;width:32px;height:32px;flex:none;display:grid;place-items:center;border-radius:99px;background:var(--wy-colors-surface);color:var(--wy-colors-text-secondary);box-shadow:0 0 0 4px var(--wy-colors-background), inset 0 0 0 1px var(--wy-colors-border)}
.wy-event:hover .wy-event-icon{box-shadow:0 0 0 4px var(--wy-colors-surface), inset 0 0 0 1px var(--wy-colors-border)}
.wy-status-success .wy-event-icon{color:var(--wy-colors-success)}
.wy-status-failed .wy-event-icon{color:var(--wy-colors-danger)}
.wy-status-pending .wy-event-icon{color:var(--wy-colors-accent)}
.wy-event-connect .wy-event-icon,.wy-event-signIn .wy-event-icon{color:var(--wy-colors-accent)}
.wy-empty-state{display:flex;flex-direction:column;align-items:center;gap:10px;padding:30px 0;font-size:13.5px;color:var(--wy-colors-text-tertiary)}
.wy-empty-icon{width:44px;height:44px;border-radius:99px;display:grid;place-items:center;background:var(--wy-colors-surface);box-shadow:inset 0 0 0 1px var(--wy-colors-border)}

.wy-gas{display:flex;align-items:center;gap:8px;margin:12px 0 8px;padding:10px 12px;border-radius:var(--wy-radii-card);font-size:13px;color:var(--wy-colors-text-secondary);background:var(--wy-colors-surface);box-shadow:inset 0 0 0 1px var(--wy-colors-border)}
.wy-gas strong{margin-left:auto;font-family:var(--wy-fonts-mono);font-weight:500;color:var(--wy-colors-text)}
.wy-chain-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}
.wy-chain-tile{position:relative;display:flex;align-items:center;gap:10px;padding:11px 10px;border-radius:var(--wy-radii-card);background:var(--wy-colors-surface);box-shadow:inset 0 0 0 1px var(--wy-colors-border);transition:background .15s, box-shadow .2s, transform .2s var(--wy-spring);text-align:left}
.wy-chain-tile:hover:not(:disabled){background:var(--wy-colors-surface-hover)}
.wy-chain-tile:active:not(:disabled){transform:scale(.97)}
.wy-chain-tile.wy-current{box-shadow:inset 0 0 0 1.5px var(--wy-colors-accent), 0 10px 26px -16px var(--wy-glow-color);background:var(--wy-accent-soft)}
.wy-chain-tile-name{flex:1;min-width:0;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-chain-tile-state{display:flex;color:var(--wy-colors-accent)}
.wy-tag{position:absolute;top:-6px;right:8px;font-family:var(--wy-fonts-mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;padding:2px 5px;border-radius:var(--wy-radii-badge);background:var(--wy-colors-warning);color:#1a1200}
.wy-banner{display:flex;gap:10px;align-items:flex-start;padding:12px;margin-top:8px;border-radius:var(--wy-radii-card);font-size:13px;line-height:1.45;background:color-mix(in srgb, var(--wy-colors-danger) 12%, transparent);color:var(--wy-colors-text)}
.wy-banner svg{flex:none;color:var(--wy-colors-danger);margin-top:1px}
.wy-error-text{margin-top:10px;font-size:13px;color:var(--wy-colors-danger);text-align:center}

.wy-receive-address{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--wy-radii-card);background:var(--wy-colors-surface);max-width:100%}
.wy-receive-address code{font-size:12px;word-break:break-all;text-align:left;color:var(--wy-colors-text-secondary)}

/* ================================================================ Custom tokens & networks */
.wy-pill{display:inline-flex;align-items:center;height:17px;margin-left:7px;padding:0 6px;border-radius:99px;font-family:var(--wy-fonts-mono);font-size:9.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;vertical-align:2px;color:var(--wy-colors-accent);background:var(--wy-accent-soft)}
.wy-token-row{position:relative}
.wy-pin{display:inline-block;width:6px;height:6px;margin-left:7px;border-radius:9px;background:var(--wy-colors-accent);vertical-align:2px;font-size:0}
.wy-row-tools{position:absolute;right:6px;top:50%;display:flex;gap:4px;padding-left:18px;transform:translateY(-50%);opacity:0;pointer-events:none;transition:opacity .15s;
  background:linear-gradient(90deg,transparent,var(--wy-colors-surface) 16px)}
.wy-token-row:hover .wy-row-tools,.wy-row-tools:focus-within{opacity:1;pointer-events:auto}
@media (hover:none){.wy-row-tools{position:static;transform:none;opacity:1;pointer-events:auto;background:none;padding-left:0}}
.wy-danger-hover:hover{color:var(--wy-colors-danger);background:color-mix(in srgb, var(--wy-colors-danger) 12%, transparent)}
.wy-add-row{display:flex;align-items:center;justify-content:center;gap:8px;height:42px;margin-top:8px;border-radius:var(--wy-radii-card);font-size:13px;font-weight:600;color:var(--wy-colors-text-secondary);
  border:1px dashed var(--wy-colors-border);transition:color .15s,border-color .15s,background .15s}
.wy-add-row:hover{color:var(--wy-colors-text);border-color:var(--wy-accent-line);background:var(--wy-accent-soft)}
.wy-form{display:flex;flex-direction:column;gap:12px;padding:8px 2px 4px}
.wy-field{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1}
.wy-field > span{font-family:var(--wy-fonts-mono);font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--wy-colors-text-tertiary)}
.wy-input{width:100%;height:42px;padding:0 12px;border:0;outline:0;border-radius:var(--wy-radii-button);font:inherit;font-size:14px;color:var(--wy-colors-text);background:var(--wy-colors-surface);
  box-shadow:inset 0 0 0 1px var(--wy-colors-border);transition:box-shadow .2s}
.wy-input::placeholder{color:var(--wy-colors-text-tertiary)}
.wy-input:focus{box-shadow:inset 0 0 0 1px var(--wy-accent-line), 0 0 0 4px var(--wy-accent-soft)}
.wy-mono{font-family:var(--wy-fonts-mono);font-size:13px}
.wy-field-status{display:flex;align-items:center;gap:7px;margin-top:-4px;font-size:12.5px;color:var(--wy-colors-text-tertiary)}
.wy-field-error{color:var(--wy-colors-danger)}
.wy-token-preview{display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--wy-radii-card);background:var(--wy-colors-surface);box-shadow:inset 0 0 0 1px var(--wy-accent-line)}
.wy-form .wy-btn{margin-top:4px}

.wy-directory{display:flex;flex-direction:column;gap:12px}
.wy-directory .wy-search{margin-top:2px}
.wy-directory-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:4px}
.wy-directory-tile{display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 4px 10px;border-radius:var(--wy-radii-card);min-width:0;
  transition:background .15s,transform .2s var(--wy-spring);animation:wy-rise .35s var(--wy-ease) both;animation-delay:calc(var(--i,0) * 15ms)}
.wy-directory-tile:hover{background:var(--wy-colors-surface)}
.wy-directory-tile:active{transform:scale(.95)}
.wy-directory-tile .wy-wallet-icon{transition:transform .25s var(--wy-spring);background:var(--wy-colors-surface)}
.wy-directory-tile:hover .wy-wallet-icon{transform:translateY(-2px)}
.wy-directory-name{width:100%;font-size:12px;font-weight:600;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-directory-skeleton{height:92px;border-radius:var(--wy-radii-card);background:linear-gradient(90deg,var(--wy-colors-surface) 25%,var(--wy-colors-surface-hover) 50%,var(--wy-colors-surface) 75%);background-size:200% 100%;animation:wy-shimmer 1.3s linear infinite}
.wy-directory-more{display:flex;justify-content:center;align-self:center;color:var(--wy-colors-text-tertiary)}

/* ================================================================ Gate */
.wy-gate{display:flex;align-items:center;gap:16px;padding:18px;border-radius:var(--wy-radii-panel);background:
  linear-gradient(var(--wy-colors-background),var(--wy-colors-background)) padding-box,
  linear-gradient(120deg, var(--wy-accent-line), var(--wy-colors-border) 40%, var(--wy-colors-border) 60%, color-mix(in srgb, var(--wy-colors-accent-secondary) 50%, transparent)) border-box;
  border:1px solid transparent;font-family:var(--wy-fonts-body);color:var(--wy-colors-text)}
.wy-gate-lock{width:46px;height:46px;flex:none;display:grid;place-items:center;border-radius:var(--wy-radii-icon);background:var(--wy-accent-soft);color:var(--wy-colors-accent)}
.wy-gate-wrongNetwork .wy-gate-lock{background:color-mix(in srgb, var(--wy-colors-danger) 14%, transparent);color:var(--wy-colors-danger)}
.wy-gate-text{flex:1;min-width:0}
.wy-gate h3{font-size:15.5px;font-weight:700;letter-spacing:-.015em}
.wy-gate p{font-size:13.5px;color:var(--wy-colors-text-secondary);margin-top:2px;line-height:1.45}
.wy-gate .wy-btn{width:auto;flex:none}
@media (max-width:520px){.wy-gate{flex-direction:column;text-align:center}.wy-gate .wy-btn{width:100%}}

/* ================================================================ Toasts (activity island) */
.wy-toaster{position:fixed;z-index:2147483100;pointer-events:none;padding:14px;width:100%;max-width:420px}
.wy-toaster ol{display:flex;flex-direction:column;gap:8px;align-items:stretch}
.wy-toaster-top-left{top:0;left:0}.wy-toaster-top-right{top:0;right:0}.wy-toaster-bottom-left{bottom:0;left:0}.wy-toaster-bottom-right{bottom:0;right:0}
.wy-toaster-top-center{top:0;left:50%;transform:translateX(-50%)}.wy-toaster-bottom-center{bottom:0;left:50%;transform:translateX(-50%)}
.wy-toaster-top-center ol,.wy-toaster-bottom-center ol{align-items:center}
.wy-toast{
  pointer-events:auto;display:flex;align-items:center;gap:11px;padding:8px 8px 8px 10px;min-height:48px;max-width:100%;
  border-radius:calc(var(--wy-radii-panel) + 4px);background:var(--wy-colors-island-background);color:var(--wy-colors-island-text);box-shadow:var(--wy-shadows-toast);
  backdrop-filter:var(--wy-effects-panel-blur);-webkit-backdrop-filter:var(--wy-effects-panel-blur);
  animation:wy-island-in .5s var(--wy-spring) both;transform-origin:center;
}
.wy-toaster[class*=bottom] .wy-toast{animation-name:wy-island-in-b}
.wy-toast[data-state=closed]{animation:wy-island-out .22s var(--wy-ease) both}
.wy-toast-icon{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:99px;background:var(--wy-colors-surface)}
.wy-toast-success .wy-toast-icon{color:var(--wy-colors-success);background:color-mix(in srgb, var(--wy-colors-success) 14%, transparent)}
.wy-toast-error .wy-toast-icon{color:var(--wy-colors-danger);background:color-mix(in srgb, var(--wy-colors-danger) 14%, transparent)}
.wy-toast-info .wy-toast-icon{color:var(--wy-colors-accent);background:var(--wy-accent-soft)}
.wy-toast-loading .wy-toast-icon{color:var(--wy-colors-accent)}
.wy-toast-loading{box-shadow:var(--wy-shadows-toast), 0 0 0 1px var(--wy-accent-line)}
.wy-toast-content{flex:1;min-width:0;padding-right:4px}
.wy-toast-title{font-size:13.5px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-toast-desc{font-size:12px;color:var(--wy-colors-text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wy-toast-action{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 10px;border-radius:99px;font-size:12px;font-weight:600;background:var(--wy-colors-surface);flex:none}
.wy-toast-action:hover{background:var(--wy-colors-surface-hover)}
.wy-toast-close{display:grid;place-items:center;width:26px;height:26px;color:var(--wy-colors-text-tertiary);flex:none;border-radius:99px}
.wy-toast-close:hover{color:var(--wy-colors-text);background:var(--wy-colors-surface)}
@media (max-width:640px){.wy-toaster{max-width:none;left:0!important;right:0!important;transform:none!important}}

/* ================================================================ Motion */
@keyframes wy-spin{to{transform:rotate(360deg)}}
@keyframes wy-blink{50%{opacity:.4}}
@keyframes wy-fade{from{opacity:0}}
@keyframes wy-fade-out{to{opacity:0}}
@keyframes wy-pop{from{opacity:0;transform:scale(.92);filter:blur(4px)}}
@keyframes wy-pop-out{to{opacity:0;transform:scale(.96)}}
@keyframes wy-drawer-in-r{from{transform:translateX(calc(100% + 24px))}}
@keyframes wy-drawer-out-r{to{transform:translateX(calc(100% + 24px))}}
@keyframes wy-drawer-in-l{from{transform:translateX(calc(-100% - 24px))}}
@keyframes wy-drawer-out-l{to{transform:translateX(calc(-100% - 24px))}}
@keyframes wy-sheet-in{from{transform:translateY(100%)}}
@keyframes wy-sheet-out{to{transform:translateY(100%)}}
@keyframes wy-slide{from{opacity:0;transform:translateY(10px) scale(.98)}}
@keyframes wy-rise{from{opacity:0;transform:translateY(8px)}}
@keyframes wy-shimmer{to{background-position:-200% 0}}
@keyframes wy-qr-in{from{opacity:0;transform:scale(.9) rotate(-2deg);filter:blur(8px)}}
@keyframes wy-bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}
@keyframes wy-draw{to{stroke-dashoffset:0}}
@keyframes wy-ripple{from{transform:scale(.8);opacity:.9}to{transform:scale(1.7);opacity:0}}
@keyframes wy-fan{from{opacity:0;transform:rotate(0) translateY(14px) scale(.8)}}
@keyframes wy-island-in{from{opacity:0;transform:translateY(-14px) scale(.6,.8);filter:blur(4px)}}
@keyframes wy-island-in-b{from{opacity:0;transform:translateY(14px) scale(.6,.8);filter:blur(4px)}}
@keyframes wy-island-out{to{opacity:0;transform:scale(.7,.8);filter:blur(4px)}}
@media (prefers-reduced-motion:reduce){
  [data-wyllet] *,[data-wyllet] *::before,[data-wyllet] *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  [data-wyllet] .wy-spinner,[data-wyllet] .wy-orbit-ring{animation-duration:1s!important;animation-iteration-count:infinite!important}
}
.wy-no-motion *,.wy-no-motion *::before,.wy-no-motion *::after,.wy-no-motion{animation:none!important;transition:none!important}
`
