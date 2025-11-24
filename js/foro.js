const SUPABASE_URL = 'https://sswbswainknbkhdpitqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd2Jzd2FpbmtuYmtoZHBpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTU4NDgsImV4cCI6MjA3OTAzMTg0OH0.lWIrilecuOgLQOjYzyfhZxNevd8F6l-KynukUV8Odt0';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== Login ==========
async function loginConSupabase() {
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });
  if (error) console.error('Error al iniciar sesión:', error.message);
}

// ========== Menú desplegable ==========
function toggleMasMenu(event) {
  event.stopPropagation();
  const submenu = document.getElementById('masSubmenu');
  const menuWrapper = document.querySelector('.mas-menu');
  if (!submenu || !menuWrapper) return;
  submenu.classList.toggle('hidden');
  menuWrapper.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const submenu = document.getElementById('masSubmenu');
  const menuWrapper = document.querySelector('.mas-menu');
  if (!submenu || !menuWrapper) return;
  if (!menuWrapper.contains(e.target)) {
    submenu.classList.add('hidden');
    menuWrapper.classList.remove('open');
  }
});

// ========== Renderizar usuario ==========
function renderUserUI(name, imageUrl) {
  const brand = document.querySelector('.brand');
  if (!brand) return;

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.style.display = 'none';

  let existing = brand.querySelector('.user-block');
  if (!existing) {
    existing = document.createElement('div');
    existing.className = 'user-block';
    existing.style.display = 'inline-flex';
    existing.style.alignItems = 'center';
    existing.style.gap = '8px';
    brand.appendChild(existing);
  } else {
    existing.innerHTML = '';
  }

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  const img = document.createElement('img');
  img.src = imageUrl || 'img/default.png';
  img.alt = name;
  img.style.width = '32px';
  img.style.height = '32px';
  img.style.borderRadius = '50%';
  avatar.appendChild(img);

  const saludo = document.createElement('span');
  saludo.className = 'saludo';
  saludo.textContent = `Bienvenido ${name}`;
  saludo.style.color = '#ffffff';

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'logout-btn hidden';
  logoutBtn.textContent = 'Cerrar sesión';
  avatar.style.cursor = 'pointer';
  avatar.onclick = () => {
    logoutBtn.classList.toggle('visible');
    logoutBtn.classList.toggle('hidden');
  };
  logoutBtn.onclick = async () => {
    await sb.auth.signOut();
    localStorage.clear();
    location.href = 'index.html';
  };

  existing.appendChild(avatar);
  existing.appendChild(saludo);
  existing.appendChild(logoutBtn);
}

// ========== Publicar comentario ==========
async function publicarComentario() {
  const contenido = document.getElementById('nuevoComentario').value.trim();
  if (!contenido) return alert("Escribe algo antes de publicar.");

  const { data: { session }, error } = await sb.auth.getSession();
  if (error || !session?.user) return alert("Debes iniciar sesión.");

  const email = session.user.email;

  if (window.comentarioEditandoId) {
    const { error } = await sb
      .from('comentarios')
      .update({ contenido })
      .eq('id', window.comentarioEditandoId);

    if (error) {
      alert('Error al editar comentario.');
      console.error(error.message);
    } else {
      alert('✅ Comentario editado.');
      window.comentarioEditandoId = null;
      location.reload();
    }
    return;
  }

  const { error: insertError } = await sb.from('comentarios').insert({
    contenido,
    autor: email,
    respuesta_a: window.respuestaAComentarioId || null,
    created_at: new Date()
  });

  if (insertError) {
    alert("Error al publicar comentario.");
    console.error(insertError.message);
  } else {
    alert("✅ Comentario publicado.");
    window.respuestaAComentarioId = null;
    location.reload();
  }
}

// ========== Cargar comentarios ==========
async function cargarComentarios() {
  const { data, error } = await sb.from('comentarios').select('*').order('created_at', { ascending: false });
  if (error) return console.error(error);

  const container = document.getElementById('comentariosContainer');
  container.innerHTML = '';

  const { data: { session } } = await sb.auth.getSession();
  const user = session?.user || null;
  const email = user?.email || null;
  const role = localStorage.getItem('userRole') || 'anon';

  window.comentarios = data;

  data.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comentario';
    div.setAttribute('data-id', c.id);

    div.innerHTML = `
      <p><strong>${c.autor}</strong>: ${c.contenido}</p>
      <small>${new Date(c.created_at).toLocaleString()}</small>
      <div class="acciones-comentario">
  ${role !== 'anon' ? `<button onclick="responderComentario('${c.id}', '${c.autor}')">Responder</button>` : ''}

        ${email === c.autor ? `
          <button onclick="editarComentario('${c.id}')">Editar</button>
          <button onclick="eliminarComentario('${c.id}')">Eliminar</button>
        ` : ''}
        ${role === 'admin' ? `
          <button onclick="eliminarComentario('${c.id}')">Eliminar como admin</button>
        ` : ''}
      </div>
    `;
    container.appendChild(div);
  });
}

// ========== Funciones de acción ==========
function responderComentario(comentarioId, autor) {
  const textarea = document.getElementById('nuevoComentario');
  textarea.value = `@${autor} `;
  textarea.focus();
  window.respuestaAComentarioId = comentarioId; // ✅ ahora es un UUID válido
}


function editarComentario(id) {
  const comentario = window.comentarios.find(c => c.id === id);
  if (!comentario) return;
  const textarea = document.getElementById('nuevoComentario');
  textarea.value = comentario.contenido;
  textarea.focus();
  window.comentarioEditandoId = id;
}

async function eliminarComentario(id) {
  const confirmar = confirm('¿Seguro que deseas eliminar este comentario?');
  if (!confirmar) return;

  const { error } = await sb.from('comentarios').delete().eq('id', id);
  if (error) {
    alert('Error al eliminar comentario.');
    console.error(error.message);
  } else {
    alert('✅ Comentario eliminado.');
    location.reload();
  }
}

// ========== Restaurar sesión ==========
document.addEventListener('DOMContentLoaded', async () => {
  let role = 'anon';

  const { data: { session }, error } = await sb.auth.getSession();
  const user = session?.user || null;

  if (user) {
    const name = user.user_metadata?.name || 'Usuario';
    const imageUrl = user.user_metadata?.avatar_url || 'img/default.png';
    const email = user.email;

    const { data: rolData } = await sb
      .from('users_roles')
      .select('role')
      .eq('email', email)
      .single();

    role = rolData?.role || 'user';
    localStorage.setItem('userRole', role);
    renderUserUI(name, imageUrl);
    document.getElementById('formularioComentario').classList.remove('hidden');
  } else {
    document.getElementById('mensajeLogin').classList.remove('hidden');
  }

  if (role !== 'admin') {
    const adminOpcionesProducto = document.getElementById('adminOpcionesProducto');
    const adminOpcionesRoles = document.getElementById('adminOpcionesRoles');
    if (adminOpcionesProducto) adminOpcionesProducto.style.display = 'none';
    if (adminOpcionesRoles) adminOpcionesRoles.style.display = 'none';
  }

  cargarComentarios();
  
});

