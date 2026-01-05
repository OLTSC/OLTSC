const MASTER_KEYS = ["admin2024", "ANGEL2024", "LTSC2024"];
const COLAB_KEYS = ["colab123", "GUEST2024"];
let currentUserRole = 'invitado';

let templates = JSON.parse(localStorage.getItem('oltsc_data')) || [
    { id: 1, type: 'visio', name: 'Arquitectura Red Local', date: '2026-01-02', fileData: null },
    { id: 2, type: 'project', name: 'Plan Maestro LTSC', date: '2026-01-01', fileData: null },
    { id: 3, type: 'excel', name: 'Control de Costos 2.0', date: '2025-12-15', fileData: null },
    { id: 4, type: 'access', name: 'Base de Datos a gran escala.', date: '2026-01-03', fileData: null },
    { id: 5, type: 'word', name: 'Documentación Técnica de Red', date: '2026-01-04', fileData: null },
    { id: 6, type: 'powerpoint', name: 'Presentación Ejecutiva LTSC', date: '2026-01-04', fileData: null },
    { id: 7, type: 'dev', name: 'Script de Automatización Core', date: '2026-01-04', fileData: null },
    { id: 8, type: 'pseint', name: 'Algoritmo de Validación Lógica', date: '2026-01-04', fileData: null }
];

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderTemplates();
    initSecurity();
});

function saveToStorage() {
    localStorage.setItem('oltsc_data', JSON.stringify(templates));
}

function showError() {
    const alertBox = document.getElementById('errorAlert');
    if (alertBox) {
        alertBox.classList.add('show');
        setTimeout(() => alertBox.classList.remove('show'), 3000);
    }
}

function openLogin() {
    if (currentUserRole !== 'invitado') {
        currentUserRole = 'invitado';
        document.body.classList.remove('is-admin', 'is-colab');
        document.getElementById('adminLoginBtn').classList.remove('bg-green-600', 'text-white', 'bg-blue-600');
        document.getElementById('userRoleStatus').innerText = "MODO INVITADO ACTIVADO";
        renderTemplates();
        return;
    }
    const modal = document.getElementById('loginModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.getElementById('loginPassInput').focus();
}

function processLogin() {
    const passInput = document.getElementById('loginPassInput');
    const pass = passInput.value;
    
    if (MASTER_KEYS.includes(pass)) {
        currentUserRole = 'admin';
        document.body.classList.add('is-admin');
        document.getElementById('adminLoginBtn').classList.add('bg-green-600', 'text-white');
        document.getElementById('userRoleStatus').innerText = "ADMINISTRADOR: ANGEL CHAVARRÍA";
        closeModal('loginModal');
    } else if (COLAB_KEYS.includes(pass)) {
        currentUserRole = 'colab';
        document.body.classList.add('is-colab');
        document.getElementById('adminLoginBtn').classList.add('bg-blue-600', 'text-white');
        document.getElementById('userRoleStatus').innerText = "ACCESO: COLABORADOR";
        closeModal('loginModal');
    } else {
        showError();
    }
    passInput.value = '';
    renderTemplates();
}

function searchTemplates() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    renderTemplates('all', query);
}

function renderTemplates(filter = 'all', search = '') {
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = '';
    
    let filtered = filter === 'all' ? templates : templates.filter(t => t.type === filter);
    if (search) {
        filtered = filtered.filter(t => t.name.toLowerCase().includes(search));
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-20 text-center text-slate-600 font-black uppercase tracking-[0.3em]">No se encontraron archivos</div>`;
        return;
    }

    filtered.forEach(t => {
        const icon = { word:'file-text', excel:'sheet', powerpoint:'presentation', access:'database', visio:'network', project:'calendar-range', dev: 'code-2', pseint: 'terminal' }[t.type];
        const color = { word:'text-blue-500', excel:'text-green-600', powerpoint:'text-orange-500', access: 'text-red-600', visio:'text-indigo-500', project:'text-green-700', dev: 'text-blue-800', pseint: 'text-yellow-500' }[t.type];

        grid.innerHTML += `
            <div class="office-card p-7 rounded-[2rem] flex flex-col h-full animate-fadeIn">
                <div class="flex justify-between items-start mb-6">
                    <div class="w-12 h-12 bg-[#0d1117] rounded-xl flex items-center justify-center shadow-inner">
                        <i data-lucide="${icon}" class="${color} w-7 h-7"></i>
                    </div>
                    <button onclick="deleteTemplate(${t.id})" class="admin-only p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
                <h3 class="font-black text-white text-lg leading-tight mb-2 truncate">${t.name}</h3>
                <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-6">${t.type} RESOURCE</p>
                
                <div class="mt-auto pt-6 border-t border-[#30363d] flex justify-between items-center">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Publicado</span>
                        <span class="text-[11px] text-slate-400 font-mono">${t.date}</span>
                    </div>
                    
                    <button onclick="downloadFile(${t.id})" class="colab-only bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                        <i data-lucide="download" class="w-3 h-3"></i> Bajar
                    </button>

                    <div onclick="openLogin()" class="download-lock-notice">
                        <i data-lucide="lock" class="w-3 h-3"></i> PIN REQUERIDO
                    </div>
                </div>
            </div>
        `;
    });
    lucide.createIcons();
}

function updateFileStatus() {
    const file = document.getElementById('realFileInput').files[0];
    if (file) {
        document.getElementById('fileStatusText').innerText = "✓ LISTO: " + file.name;
        document.getElementById('fileStatusText').classList.replace('text-slate-500', 'text-green-400');
    }
}

function downloadFile(id) {
    if (currentUserRole === 'invitado') {
        showError();
        openLogin();
        return;
    }

    const item = templates.find(t => t.id === id);
    if (item && item.fileData) {
        const link = document.createElement('a');
        link.href = item.fileData; 
        link.download = item.name;
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
    } else showError();
}

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('realFileInput');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        templates.unshift({
            id: Date.now(),
            type: document.getElementById('softwareType').value,
            name: document.getElementById('templateName').value,
            date: new Date().toISOString().split('T')[0],
            fileData: event.target.result
        });
        saveToStorage();
        renderTemplates();
        closeModal('uploadModal');
        this.reset();
        document.getElementById('fileStatusText').innerText = "Seleccionar Archivo";
    }.bind(this);
    reader.readAsDataURL(file);
});

function deleteTemplate(id) {
    if (currentUserRole !== 'admin') return;
    if (confirm("¿ELIMINAR PERMANENTEMENTE?")) {
        templates = templates.filter(t => t.id !== id);
        saveToStorage();
        renderTemplates();
    }
}

function filterTemplates(type) { renderTemplates(type); }

function openUploadModal() { 
    const m = document.getElementById('uploadModal');
    m.classList.remove('hidden'); 
    m.style.display = 'flex';
}

function closeModal(id) { 
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('hidden'); 
        m.classList.remove('flex');
        m.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function initSecurity() {
    const overlay = document.getElementById('securityOverlay');
    const trigger = (e) => { 
        if (currentUserRole !== 'invitado') return;
        e.preventDefault(); 
        if (overlay) {
            overlay.style.display = 'flex'; 
            setTimeout(() => overlay.style.display = 'none', 3000);
        }
    };
    document.addEventListener('contextmenu', trigger);
    document.addEventListener('keydown', (e) => {
        if (currentUserRole === 'invitado') {
            if ((e.ctrlKey && ['u','s','i','j','c'].includes(e.key.toLowerCase())) || e.key === 'F12') {
                trigger(e);
            }
        }
    });
}

function openLegalModal(title) {
    const modal = document.getElementById('legalModal');
    const titleElement = document.getElementById('legalTitle');
    const contentElement = document.getElementById('legalContent');

    titleElement.innerText = title;

    const textos = {
        'Términos de Uso': `
            <div class='space-y-4 text-justify'>
                <p><b>1. ACEPTACIÓN DE TÉRMINOS:</b> Al acceder al Repositorio Maestro OLTSC 2024, el usuario reconoce y acepta de forma vinculante las condiciones establecidas por el Administrador <b>Angel Chavarría</b>. El acceso no autorizado o el bypass de medidas de seguridad constituye una violación directa a estos términos.</p>
                <p><b>2. PROPIEDAD INTELECTUAL:</b> Todo el código fuente, diseño de interfaz y arquitectura de datos son propiedad exclusiva de Angel Chavarría. Queda estrictamente prohibida la reproducción total o parcial, ingeniería inversa o descompilación del sitio bajo las normativas internacionales de Derechos de Autor.</p>
                <p><b>3. RESTRICCIONES DE ACCESO:</b> El uso del sistema está limitado a visualización y descarga autorizada. Cualquier intento de inyección de código, scraping o denegación de servicio será reportado a las autoridades de delitos informáticos pertinentes.</p>
            </div>`,

        'Condiciones Generales': `
            <div class='space-y-4 text-justify'>
                <p><b>1. NATURALEZA DEL SERVICIO:</b> OLTSC 2024 es un repositorio privado de herramientas ofimáticas. El Administrador se reserva el derecho de admitir, restringir o revocar el acceso a cualquier usuario sin previo aviso y sin responsabilidad alguna.</p>
                <p><b>2. USO DE RECURSOS:</b> Las plantillas (Word, Excel, etc.) se proporcionan "tal cual". El usuario asume toda responsabilidad por el uso de estos archivos en sus entornos profesionales. El Administrador no se hace responsable por daños derivados de una implementación incorrecta o pérdida de datos.</p>
                <p><b>3. PROHIBICIÓN DE REDISTRIBUCIÓN:</b> Queda terminantemente prohibida la venta, sublicenciamiento o distribución comercial de los recursos alojados sin un consentimiento expreso y por escrito del Administrador, bajo pena de acciones legales por daños y perjuicios.</p>
            </div>`,

        'Políticas de Cookies': `
            <div class='space-y-4 text-justify'>
                <p><b>1. ALMACENAMIENTO TÉCNICO:</b> Este sitio utiliza tecnologías de almacenamiento local (LocalStorage y SessionStorage) con el único fin de garantizar la funcionalidad operativa del sistema, tales como el mantenimiento de sesiones activas y preferencias de filtrado.</p>
                <p><b>2. SEGURIDAD DE SESIÓN:</b> No se utilizan cookies de seguimiento de terceros ni herramientas de análisis publicitario. La información almacenada es de carácter técnico y volátil, diseñada para proteger la integridad del acceso del usuario.</p>
                <p><b>3. CONSENTIMIENTO:</b> Al navegar por esta plataforma, el usuario consiente el uso de estos identificadores técnicos necesarios para la ejecución del protocolo de seguridad y administración de roles.</p>
            </div>`,

        'Privacidad de Datos': `
            <div class='space-y-4 text-justify'>
                <p><b>1. TRATAMIENTO DE DATOS:</b> En cumplimiento con estándares internacionales de protección de datos, la información recolectada en el formulario de colaborador (Nombre, Email) será tratada bajo los principios de licitud, lealtad y transparencia.</p>
                <p><b>2. FINALIDAD EXCLUSIVA:</b> Los datos personales tendrán como única finalidad la gestión de solicitudes de acceso y comunicación directa entre el solicitante y el Administrador Angel Chavarría. No se cederán datos a terceros bajo ninguna circunstancia.</p>
                <p><b>3. DERECHOS ARCO:</b> El usuario podrá solicitar en cualquier momento la rectificación o eliminación definitiva de su información de los registros internos mediante los canales oficiales de contacto proporcionados en el pie de página.</p>
                <p><b>4. JURISDICCIÓN:</b> Cualquier controversia legal relacionada con la privacidad de esta plataforma se someterá a la jurisdicción competente en la materia, reservándose el Administrador el derecho a emprender acciones penales en caso de uso malintencionado de la información expuesta.</p>
            </div>`,
            'Arquitectura': `
            <div class='space-y-4 text-justify'>
                <div class='flex items-center gap-3 mb-6 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20'>
                    <i data-lucide="bot" class="text-blue-400 w-8 h-8"></i>
                    <div>
                        <h4 class='text-blue-400 font-black uppercase text-[10px] tracking-widest'>Digital Architect Core</h4>
                        <p class='text-[9px] text-slate-500 font-mono uppercase'>Powered by Angel Chavarría</p>
                    </div>
                </div>
                <p><b>1. CO-AUTORÍA DIGITAL:</b> Este sistema representa una integración técnica de mi visión como el desarrollador de este sitio, siendo yo <b>Angel Chavarría</b> el creador y con la capacidad algorítmica de la IA.</p>
                <p><b>2. OPTIMIZACIÓN LÓGICA:</b> La estructura del código ha sido auditada para garantizar persistencia de datos y una interfaz de usuario fluida.</p>
                <p><b>3. SEGURIDAD:</b> Se han implementado protocolos de protección de código para salvaguardar la integridad de los recursos alojados.</p>
            </div>`,
'Guía Word': `
    <div class='space-y-4'>
        <div class='p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl mb-4'>
            <h4 class='text-white font-black uppercase text-xs tracking-widest'>Protocolo de Documentación Estructural</h4>
        </div>
        <div class='text-sm text-slate-300 space-y-3'>
            <p><b>Permitido:</b> Manuales técnicos, especificaciones y actas (.docx, .pdf).</p>
            <p><b>Restricciones Técnicas:</b> Todo documento con macros (<b>.docm</b>) debe incluir una descripción de la función del script. Se prohíben referencias externas a plantillas globales fuera del entorno LTSC.</p>
            <p class='text-[11px] text-slate-500 font-mono border-t border-slate-800 pt-2 uppercase'>Norma: Estilos basados en fuentes estándar para compatibilidad total.</p>
        </div>
    </div>`,

'Guía Excel': `
    <div class='space-y-4'>
        <div class='p-4 bg-green-600/10 border-l-4 border-green-600 rounded-r-xl mb-4'>
            <h4 class='text-white font-black uppercase text-xs tracking-widest'>Protocolo de Ingeniería de Datos</h4>
        </div>
        <div class='text-sm text-slate-300 space-y-3'>
            <p><b>Permitido:</b> Matrices de riesgo y cronogramas (.xlsx, .xlsb).</p>
            <p><b>Automatización y VBA:</b> Los libros con macros deben usar <b>Option Explicit</b> en su código fuente. Se prohíbe el uso de librerías ActiveX no estándar que comprometan la portabilidad del archivo.</p>
            <p class='text-[11px] text-slate-500 font-mono border-t border-slate-800 pt-2 uppercase'>Aviso: Verifique la integridad de Power Query antes de subir.</p>
        </div>
    </div>`,

'Guía PPT': `
    <div class='space-y-4'>
        <div class='p-4 bg-orange-600/10 border-l-4 border-orange-600 rounded-r-xl mb-4'>
            <h4 class='text-white font-black uppercase text-xs tracking-widest'>Protocolo de Exposición Técnica</h4>
        </div>
        <div class='text-sm text-slate-300 space-y-3'>
            <p><b>Permitido:</b> Reportes de arquitectura y capacitación (.pptx).</p>
            <p><b>Integridad Multi-media:</b> Todo video o audio debe estar <b>incrustado</b>, no vinculado, para evitar rupturas de ruta de archivo. Los complementos (Add-ins) de terceros están restringidos.</p>
        </div>
    </div>`,

'Guía Access': `
    <div class='space-y-4'>
        <div class='p-4 bg-red-600/10 border-l-4 border-red-600 rounded-r-xl mb-4'>
            <h4 class='text-white font-black uppercase text-xs tracking-widest'>Protocolo de Gestión Relacional</h4>
        </div>
        <div class='text-sm text-slate-300 space-y-3'>
            <p><b>Permitido:</b> Bases de datos de gestión (.accdb).</p>
            <p><b>Norma de Seguridad:</b> Los archivos deben estar libres de contraseñas de nivel de base de datos no notificadas. Los módulos <b>VBA</b> deben estar compilados y sin errores de depuración pendientes.</p>
            <p class='text-[11px] text-slate-500 font-mono border-t border-slate-800 pt-2 uppercase'>Crítico: Compactar y reparar antes de realizar el upload.</p>
        </div>
    </div>`,

'Guía Visio': `
    <div class='space-y-4'>
        <div class='p-4 bg-indigo-500/10 border-l-4 border-indigo-500 rounded-r-xl mb-4'>
            <h4 class='text-white font-black uppercase text-xs tracking-widest'>Protocolo de Infraestructura Visual</h4>
        </div>
        <div class='text-sm text-slate-300 space-y-3'>
            <p><b>Permitido:</b> Topologías y diagramas de procesos (.vsdx).</p>
            <p><b>Estandarización:</b> Uso obligatorio de stencils estándar. Los datos vinculados a formas (Shape Data) deben ser locales y no depender de conexiones a servidores externos no autorizados.</p>
        </div>
    </div>`,

'Guía Project': `
    <div class='space-y-4'>
        <div class='p-4 bg-green-700/10 border-l-4 border-green-700 rounded-r-xl mb-4'>
            <h4 class='text-white font-black uppercase text-xs tracking-widest'>Protocolo de Gestión Maestro</h4>
        </div>
        <div class='text-sm text-slate-300 space-y-3'>
            <p><b>Permitido:</b> Planes de proyecto y Gantt (.mpp).</p>
            <p><b>Sincronización:</b> Se debe validar que no existan recursos compartidos vinculados a archivos externos (Pool de recursos) que no estén presentes en el repositorio.</p>
        </div>
    </div>`,

'Guía DEV++': `
    <div class='space-y-4'>
        <div class='p-4 bg-blue-800/10 border-l-4 border-blue-800 rounded-r-xl mb-4'>
            <h4 class='text-white font-black uppercase text-xs tracking-widest'>Protocolo de Desarrollo y Automatización</h4>
        </div>
        <div class='text-sm text-slate-300 space-y-3'>
            <p><b>Permitido:</b> Scripts (.js, .py, .bat) y código fuente documentado.</p>
            <p><b>Seguridad de Código:</b> Queda prohibido subir scripts que realicen llamadas externas (APIs) sin autorización del Administrador. Todo código debe incluir comentarios de cabecera con autoría y versión.</p>
            <p class='text-[11px] text-slate-500 font-mono border-t border-slate-800 pt-2 uppercase'>Advertencia: El código malicioso será detectado y sancionado.</p>
        </div>
    </div>`,

'Guía PSeInt': `
    <div class='space-y-4'>
        <div class='p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-xl mb-4'>
            <h4 class='text-white font-black uppercase text-xs tracking-widest'>Protocolo de Lógica Algorítmica</h4>
        </div>
        <div class='text-sm text-slate-300 space-y-3'>
            <p><b>Permitido:</b> Algoritmos y lógica de entrenamiento (.psc).</p>
            <p><b>Configuración:</b> Se recomienda utilizar el perfil de configuración "Estricto" para garantizar la formación técnica correcta en el uso de variables y sintaxis.</p>
        </div>
    </div>`
    };

    contentElement.innerHTML = textos[title] || 'Información no disponible.';

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    lucide.createIcons();
}

function openCreatorModal() {
    const modal = document.getElementById('creatorModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        lucide.createIcons();
    }
}

function filterTemplates(type) {
    renderTemplates(type);
    
    const titulos = {
        'word': 'Guía Word',
        'excel': 'Guía Excel',
        'powerpoint': 'Guía PPT',
        'access': 'Guía Access',
        'visio': 'Guía Visio',
        'project': 'Guía Project',
        'dev': 'Guía DEV++',
        'pseint': 'Guía PSeInt'
    };
    
    if (titulos[type]) {
        openLegalModal(titulos[type]);
    }
}

function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    const status = document.getElementById('musicStatus');
    const icon = document.getElementById('musicIcon');

    if (audio.paused) {
        audio.play().catch(e => console.log("Autoplay bloqueado por el navegador"));
        btn.classList.add('playing');
        status.innerText = "System Audio: ON";
        status.style.color = "var(--primary)";
        icon.innerHTML = '<i data-lucide="volume-2"></i>';
    } else {
        audio.pause();
        btn.classList.remove('playing');
        status.innerText = "System Audio: OFF";
        status.style.color = "#64748b";
    }
    if(window.lucide) lucide.createIcons();
}

const bgMusic = document.getElementById('bgMusic');
if(bgMusic) bgMusic.volume = 0.5;

function gestionarAudioAlerta(isError) {
    const audio = document.getElementById('bgMusic');
    const body = document.body;
    
    if (!audio) return;

    if (isError) {
        body.classList.add('system-error');
        let vol = audio.volume;
        const interval = setInterval(() => {
            if (vol > 0.1) {
                vol -= 0.05;
                audio.volume = Math.max(vol, 0.1);
            } else {
                clearInterval(interval);
            }
        }, 50);
    } else {
        body.classList.remove('system-error');
        let vol = audio.volume;
        const interval = setInterval(() => {
            if (vol < 0.5) {
                vol += 0.05;
                audio.volume = Math.min(vol, 0.5);
            } else {
                clearInterval(interval);
            }
        }, 50);
    }
}

function verificarPin() {
    if (pinCorrecto) {
    } else {
        const alerta = document.querySelector('.custom-alert');
        alerta.classList.add('show');
        
        gestionarAudioAlerta(true);
        
        setTimeout(() => {
            alerta.classList.remove('show');
            gestionarAudioAlerta(false);
        }, 3000);
    }
}
