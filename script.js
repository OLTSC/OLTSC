const SUPABASE_URL = 'https://zlpewrgymhqrvrxebsgx.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_BV9t1tBuUnI0TY51e89fOQ_GVOFAPzc';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let repository = [];

const rules = {
    'word': ['doc', 'docx', 'dot', 'rtf', 'docm', 'dotx', 'dotm'],
    'excel': ['xls', 'xlsx', 'csv', 'xlsm', 'xltx', 'xltm', 'xlsb', 'xlam'],
    'powerpoint': ['ppt', 'pptx', 'pps', 'ppsx', 'potx', 'potm', 'pptm', 'ppsm'],
    'access': ['accdb', 'mdb', 'accde', 'accdt', 'accdr'],
    
    'visio': ['vsd', 'vsdx', 'vssx', 'vstx', 'vsdm', 'vssm', 'vstm'],
    'project': ['mpp', 'mpt', 'xml'],
    'publisher': ['pub'],
    'powerbi': ['pbix', 'pbit'],
    
    'onenote': ['one', 'onetoc2', 'onepkg'],
    'outlook': ['msg', 'pst', 'ost', 'eml'],
    'automate': ['json', 'zip'], 
    'apps': ['msapp', 'zip'],
    'pages': ['html', 'htm', 'url', 'aspx'],
    'tdo': ['txt', 'pdf', 'docx'],
    'forms': ['xlsx', 'csv'],
    'loop': ['loop', 'txt', 'docx'],
    'teams': ['zip', 'pdf', 'docx', 'pptx', 'xlsx'],
    'sharepoint': ['zip', 'aspx', 'pdf'],

    'cpp': ['cpp', 'h', 'hpp', 'c', 'cc', 'cxx', 'ino'],
    'pseint': ['psc'],
    'html': ['html', 'htm', 'xhtml', 'php'],
    'css': ['css', 'scss', 'sass', 'less'],
    'js': ['js', 'json', 'jsx', 'ts', 'tsx', 'vue'],
    'python': ['py', 'pyw', 'ipynb', 'pyc'],
    'java': ['java', 'jar', 'class', 'jsp'],
    
    'pictures': ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff'],
    'mp3': ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'],
    'pdf': ['pdf'],
    'archive': ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
    'txt': ['txt', 'md', 'log', 'ini', 'yaml', 'yml', 'conf']
};

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const pinInput = document.getElementById('pinInput');
    if(pinInput) {
        pinInput.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') checkPin(); 
        });
    }
});

async function checkPin() {
    const inputPin = document.getElementById('pinInput').value;
    const lockScreen = document.getElementById('lockScreen');
    const errorMsg = document.getElementById('pinError');
    const btn = document.querySelector('#lockScreen .btn-primary-neon');

    if (!inputPin) return;
    btn.innerText = "VERIFICANDO...";

    try {
        const { data, error } = await supabaseClient
            .from('vault')
            .select('pin_hash')
            .eq('pin_hash', inputPin)
            .maybeSingle();

        if (data) {
            lockScreen.style.opacity = "0";
            setTimeout(() => {
                lockScreen.style.display = "none";
                initUploadForm(); 
            }, 500);
            loadFilesFromCloud(); 
        } else {
            errorMsg.style.display = "block";
            errorMsg.innerText = "ACCESO DENEGADO - PIN INVÁLIDO";
            btn.innerText = "REINTENTAR";
        }
    } catch (err) {
        btn.innerText = "ERROR DE RED";
    }
}

async function loadFilesFromCloud() {
    const { data, error } = await supabaseClient
        .from('repo_metadata')
        .select('*')
        .order('id', { ascending: false });
    
    if (!error) {
        repository = data || [];
        renderRepo(repository);
    }
}

function isAllowedExtension(fileName, category) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (!rules[category.toLowerCase()]) return true;
    return rules[category.toLowerCase()].includes(ext);
}

function initUploadForm() {
    const form = document.getElementById('uploadForm');
    if (!form) return;

    form.onsubmit = async function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('mainFileInput');
        const fileName = document.getElementById('fileNameInput').value;
        const category = document.getElementById('categorySelect').value;
        const file = fileInput.files[0];
        const alertBox = document.getElementById('validationAlert');

        if (!file) return;

        if (!isAllowedExtension(file.name, category)) {
            if (alertBox) {
                alertBox.style.display = 'block';
                alertBox.innerText = `ERROR: El archivo .${file.name.split('.').pop()} no es válido para ${category.toUpperCase()}`;
                
                setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
            } else {
                alert("Extensión no válida para esta categoría.");
            }
            return;
        }

        const submitBtn = e.target.querySelector('.btn-primary-neon');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "SUBIENDO...";
        submitBtn.disabled = true;

        const filePath = `uploads/${Date.now()}_${file.name}`;
        
        const { error: storageError } = await supabaseClient.storage
            .from('repo-files')
            .upload(filePath, file);

        if (storageError) {
            alert("Error: " + storageError.message);
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        const { data: urlData } = supabaseClient.storage
            .from('repo-files')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabaseClient
            .from('repo_metadata')
            .insert([{
                name: fileName,
                category: category,
                file_name: file.name,
                file_url: urlData.publicUrl,
                storage_path: filePath,
                date: new Date().toLocaleDateString()
            }]);

        if (!dbError) {
            await loadFilesFromCloud();
            closeModal();
        }
        
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    };
}

function renderRepo(data) {
    const grid = document.getElementById('repoGrid');
    if(!grid) return;
    grid.innerHTML = '';
    
    data.forEach(file => {
        const iconName = getIcon(file.category);
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-icon" style="color: var(--primary); filter: drop-shadow(0 0 5px var(--primary));">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="file-info">
                <h3>${file.name}</h3>
                <p>${file.category} • ${file.date}</p>
                <small>${file.file_name}</small>
            </div>
            <div style="margin-left: auto; display: flex; gap: 15px; align-items: center;">
                <a href="${file.file_url}" target="_blank" download="${file.file_name}" style="color: var(--primary);">
                    <i data-lucide="download"></i>
                </a>
                <button onclick="deleteFileFromCloud('${file.id}', '${file.storage_path}')" style="background:none; border:none; color: #ff4d4d; cursor:pointer;">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function getIcon(cat) {
    const icons = {
        word: 'file-text', excel: 'sheet', powerpoint: 'presentation', access: 'database',
        visio: 'network', project: 'calendar-range', onenote: 'sticky-note', outlook: 'mail',
        publisher: 'layout', powerbi: 'bar-chart-3', automate: 'zap', apps: 'layout-grid',
        pages: 'globe', tdo: 'check-square', forms: 'list-todo', loop: 'rotate-cw',
        teams: 'users', sharepoint: 'share-2', cpp: 'code-2', pseint: 'terminal',
        html: 'file-code', css: 'palette', js: 'scroll', python: 'terminal-square',
        java: 'coffee', pictures: 'image', mp3: 'music', pdf: 'file-type-2', archive: 'file-archive', txt: 'align-left'
    };
    return icons[cat.toLowerCase()] || 'file-question';
}

async function deleteFileFromCloud(id, storagePath) {
    if(confirm('¿Deseas eliminar este archivo?')) {
        await supabaseClient.storage.from('repo-files').remove([storagePath]);
        await supabaseClient.from('repo_metadata').delete().eq('id', id);
        await loadFilesFromCloud();
    }
}

function filterRepo(category) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
    const filtered = category === 'all' ? repository : repository.filter(f => f.category.toLowerCase() === category.toLowerCase());
    renderRepo(filtered);
}

function openModal() { document.getElementById('uploadModal').style.display = 'flex'; }
function closeModal() { 
    document.getElementById('uploadModal').style.display = 'none'; 
    document.getElementById('uploadForm').reset();
    document.getElementById('fileLabel').innerText = "Seleccionar Archivo";
    const alertBox = document.getElementById('validationAlert');
    if(alertBox) alertBox.style.display = 'none';
}

function updateFileName() {
    const fileInput = document.getElementById('mainFileInput');
    const label = document.getElementById('fileLabel');
    if (fileInput.files[0]) {
        label.innerText = fileInput.files[0].name;
        label.style.color = "var(--primary)";
    }
}

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showSecurityAlert();
});

document.addEventListener('keydown', (e) => {
    const forbiddenKeys = [
        (e.key === 'F12'),
        (e.ctrlKey && e.shiftKey && e.key === 'I'),
        (e.ctrlKey && e.shiftKey && e.key === 'J'),
        (e.ctrlKey && e.shiftKey && e.key === 'C'),
        (e.ctrlKey && e.key === 'u'),
        (e.ctrlKey && e.key === 'U'),
        (e.ctrlKey && e.key === 's'),
        (e.ctrlKey && e.key === 'S')
    ];

    if (forbiddenKeys.some(key => key)) {
        e.preventDefault();
        showSecurityAlert();
        return false;
    }
});

function showSecurityAlert() {
    const alert = document.getElementById('securityAlert');
    if(alert) alert.style.display = 'flex';
}

function hideSecurityAlert() {
    const alert = document.getElementById('securityAlert');
    if(alert) alert.style.display = 'none';
}

setInterval(() => {
    const before = new Date();
    debugger;
    const after = new Date();
    if (after - before > 100) {
        document.body.innerHTML = "<h1>SISTEMA BLOQUEADO POR INTENTO DE INSPECCIÓN</h1>";
    }
}, 1000);

document.addEventListener('copy', (e) => {
    e.preventDefault();
    showSecurityAlert();
    return false;
});

document.addEventListener('cut', (e) => {
    e.preventDefault();
    showSecurityAlert();
    return false;
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || 
                      e.key === 'v' || e.key === 'V' || 
                      e.key === 'x' || e.key === 'X' || 
                      e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        showSecurityAlert();
        return false;
    }
});

function showSecurityAlert() {
    const alert = document.getElementById('securityAlert');
    const box = document.querySelector('.security-box');
    
    alert.style.display = 'flex';
    lucide.createIcons();

    box.animate([
        { transform: 'translate(1px, 1px) rotate(0deg)' },
        { transform: 'translate(-1px, -2px) rotate(-1deg)' },
        { transform: 'translate(-3px, 0px) rotate(1deg)' },
        { transform: 'translate(3px, 2px) rotate(0deg)' },
        { transform: 'translate(1px, -1px) rotate(1deg)' },
        { transform: 'translate(-1px, 2px) rotate(-1deg)' }
    ], {
        duration: 100,
        iterations: 5
    });
}
