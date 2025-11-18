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
const CLIENT_ID = '1051129239562-kjqnel8ib15nqs8g28rhg17vqk55gp2a.apps.googleusercontent.com';

function loginConGoogle() {
  gapi.load('auth2', () => {
    const auth2 = gapi.auth2.init({ client_id: CLIENT_ID });

    auth2.then(() => {
      auth2.signIn().then(googleUser => {
        const profile = googleUser.getBasicProfile();
        const name = profile.getName();
        const imageUrl = profile.getImageUrl();

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        if (imageUrl) {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = name;
          avatar.appendChild(img);
        } else {
          avatar.textContent = name.charAt(0).toUpperCase();
        }

        const brand = document.querySelector('.brand');
        brand.appendChild(avatar);
        document.querySelector('.login-btn').style.display = 'none';
      }).catch(err => {
        alert("Error al iniciar sesión: " + err.error);
        console.error(err);
      });
    }).catch(err => {
      alert("Error al inicializar Google Auth: " + err.error);
      console.error(err);
    });
  });
}
