document.getElementById('year').textContent = new Date().getFullYear();

function toggleMenu(){
  const ul = document.getElementById('navLinks');
  ul.style.display = ul.style.display === 'flex' ? 'none' : 'flex';
}

function agregarSeccion(){
  const nombre = prompt('Nombre de la nueva sección (ej: Galería)');
  if(!nombre) return;
  const href = prompt('Archivo o enlace para la sección (ej: galeria.html o https://...)', '#');
  const ul = document.getElementById('navLinks');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = href || '#';
  a.textContent = nombre;
  li.appendChild(a);
  ul.appendChild(li);
  a.scrollIntoView({behavior:'smooth',block:'center'});
}

function openUpload(){
  document.getElementById('imageInput').click();
}

const input = document.getElementById('imageInput');
input.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = '';
    const img = document.createElement('img');
    img.src = ev.target.result;
    img.alt = 'Imagen subida de ejemplo';
    uploadArea.appendChild(img);
  }
  reader.readAsDataURL(file);
});
function loginConGoogle() {
  alert('Simulación: redirigiendo a login con Google...');
  // Aquí iría la lógica real de autenticación con Google
}
