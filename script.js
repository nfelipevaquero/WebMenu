document.querySelectorAll('.split').forEach(section => {
    // Efecto de inclinación 3D al mover el ratón
    section.addEventListener('mousemove', (e) => {
        const content = section.querySelector('.content');
        const rect = section.getBoundingClientRect();
        
        // Calculamos la posición del ratón relativa a la sección
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculamos la rotación (suave)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20; // Ajusta el número para más o menos inclinación
        const rotateY = (centerX - x) / 20;

        content.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    // Resetear posición cuando el ratón sale
    section.addEventListener('mouseleave', () => {
        const content = section.querySelector('.content');
        content.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
});

// Animación de entrada al cargar la página
window.addEventListener('load', () => {
    document.querySelectorAll('.content').forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = "1";
            el.classList.add('fade-in'); // Necesitarías definir esta clase o dejar que el CSS lo haga
        }, index * 300);
    });
});