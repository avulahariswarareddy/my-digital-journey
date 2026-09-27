(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t)}catch(e){}
if(!window.matchMedia||!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('anim');setTimeout(function(){if(!window.gsap||!window.ScrollTrigger)d.classList.remove('anim')},3500)}})();
