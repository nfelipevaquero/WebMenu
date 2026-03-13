// TU SHADER ORIGINAL INTACTO
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
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        
        vec2 fMosaicScal = vec2(4.0, 2.0);
        vec2 vScreenSize = vec2(256.0, 256.0);
        uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
        uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);       
          
        float t = time * 0.15 + random(uv.x) * 0.4;
        float lineWidth = 0.0015;

        vec3 colorLines = vec3(0.0);
        for(int j = 0; j < 3; j++){
            for(int i=0; i < 5; i++){
                float linePos = fract(t - 0.01*float(j) + float(i)*0.01);
                colorLines[j] += lineWidth * float(i*i) / abs(linePos - abs(uv.y));        
            }
        }

        gl_FragColor = vec4(colorLines * baseColor * 1.8, 1.0);
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

    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    function resize() {
        // Fijamos la resolución al tamaño real de la ventana para que coincida con el CSS y no se amplíe
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        uniforms.resolution.value.set(w, h);
    }

    // Solo redimensionamos cuando cambia la ventana
    window.addEventListener('resize', resize);
    resize();

    function animate(now) {
        uniforms.time.value = now * 0.0005;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

window.addEventListener('load', () => {
    setTimeout(() => {
        initShader('canvas-1', '#a855f7');
        initShader('canvas-2', '#22c55e');
        initShader('canvas-3', '#ef4444');
    }, 100);
});