const vertexShader = `
    void main() {
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform vec3 baseColor;

    float random (in float x) {
        return fract(sin(x)*1e4);
    }

    void main(void) {
        // Coordenadas normalizadas
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        
        // Mosaico sutil (mantenido de tu código)
        vec2 fMosaicScal = vec2(4.0, 2.0);
        vec2 vScreenSize = vec2(256.0, 256.0);
        uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
        uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);       
          
        // VELOCIDAD: Reducida para que sea más lenta
        float t = time * 0.2 + random(uv.x) * 0.4; 
        
        // GROSOR: Aumentado de 0.0008 a 0.002 para que NO se vea negro
        float lineWidth = 0.002;

        vec3 colorLines = vec3(0.0);
        for(int j = 0; j < 3; j++){
            for(int i=0; i < 5; i++){
                // CAMBIO CLAVE: Usamos abs(uv.y) o uv.x en lugar de length(uv) para eliminar el círculo
                // Esto hace que las líneas atraviesen toda la sección
                float linePos = fract(t - 0.01*float(j) + float(i)*0.01);
                colorLines[j] += lineWidth * float(i*i) / abs(linePos - abs(uv.y));        
            }
        }

        // Aplicamos el color y aumentamos un poco la intensidad
        vec3 finalColor = colorLines * baseColor * 1.5;
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

function initShader(containerId, colorHex) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    container.appendChild(renderer.domElement);

    const uniforms = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        baseColor: { value: new THREE.Color(colorHex) }
    };

    const material = new THREE.ShaderMaterial({
        uniforms, vertexShader, fragmentShader
    });

    // Usamos PlaneGeometry estándar
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        uniforms.resolution.value.set(w, h);
    }

    window.addEventListener('resize', resize);
    resize();

    function animate(now) {
        // Multiplicador de tiempo muy bajo para máxima lentitud
        uniforms.time.value = now * 0.0005; 
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', () => {
    initShader('canvas-1', '#a855f7'); // Púrpura
    initShader('canvas-2', '#22c55e'); // Verde
    initShader('canvas-3', '#ef4444'); // Rojo
});