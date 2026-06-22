import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';

document.addEventListener('DOMContentLoaded',()=>{
  const canvas = document.getElementById('canvas');
  let renderer = null;
  let scene = null;
  let camera = null;
  let clock = null;
  let tor = null;
  let ring = null;
  const mouse = {x:0,y:0};

  if(canvas){
    try{
      renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,100);
      camera.position.set(0,0,4);
      const ambient = new THREE.AmbientLight(0xffffff,0.5);scene.add(ambient);
      const point = new THREE.PointLight(0xffb36f,0.6,18);point.position.set(2,2,2);scene.add(point);
      const techGroup = new THREE.Group();
      const coreGeom = new THREE.BoxGeometry(1.2,1.2,1.2);
      const coreMat = new THREE.MeshStandardMaterial({color:0xddc4a0,metalness:0.4,roughness:0.35,transparent:true,opacity:0.92});
      const core = new THREE.Mesh(coreGeom, coreMat);
      const edgeGeom = new THREE.EdgesGeometry(coreGeom);
      const edgeMat = new THREE.LineBasicMaterial({color:0xff8c1a,linewidth:1,transparent:true,opacity:0.9});
      const wireframe = new THREE.LineSegments(edgeGeom, edgeMat);
      const nodeCount = 40;
      const nodePositions = new Float32Array(nodeCount * 3);
      for(let i=0;i<nodeCount;i++){
        const r = 1.35 + Math.random() * 0.4;
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.acos((Math.random()*2)-1);
        nodePositions[i*3] = Math.sin(theta) * Math.cos(phi) * r;
        nodePositions[i*3+1] = Math.sin(theta) * Math.sin(phi) * r;
        nodePositions[i*3+2] = Math.cos(theta) * r;
      }
      const nodeGeom = new THREE.BufferGeometry();
      nodeGeom.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
      const nodeMat = new THREE.PointsMaterial({color:0xffbe6e,size:0.06,transparent:true,opacity:0.95});
      const nodePoints = new THREE.Points(nodeGeom, nodeMat);
      const moduleCount = 10;
      const modules = [];
      const moduleGeom = new THREE.BoxGeometry(0.16,0.16,0.16);
      const moduleMat = new THREE.MeshStandardMaterial({color:0x2a1200,emissive:0xffbe6e,metalness:0.45,roughness:0.2});
      for(let i=0;i<moduleCount;i++){
        const module = new THREE.Mesh(moduleGeom, moduleMat);
        const angle = (i / moduleCount) * Math.PI * 2;
        module.position.set(Math.cos(angle) * 1.9, Math.sin(angle * 0.7) * 0.3, Math.sin(angle) * 0.75);
        module.rotation.set(Math.random() * 0.4, Math.random() * 0.4, Math.random() * 0.4);
        modules.push(module);
        techGroup.add(module);
      }
      techGroup.userData.modules = modules;
      techGroup.userData.core = core;
      techGroup.add(core, wireframe, nodePoints);
      tor = techGroup;
      scene.add(techGroup);
      ring = new THREE.Mesh(new THREE.RingGeometry(1.4,1.7,64),new THREE.MeshBasicMaterial({color:0xffb36f,transparent:true,opacity:0.22,side:THREE.DoubleSide}));
      ring.rotation.x = Math.PI/2;
      scene.add(ring);
      const codeChars = ['<>','{}','//',';','=>'];
      const codeTextures = codeChars.map(char=>{
        const canvas2 = document.createElement('canvas');
        canvas2.width = 64;
        canvas2.height = 64;
        const ctx = canvas2.getContext('2d');
        ctx.clearRect(0,0,64,64);
        ctx.fillStyle = 'rgba(255,190,110,0.05)';
        ctx.fillRect(0,0,64,64);
        ctx.font = 'bold 26px monospace';
        ctx.fillStyle = 'rgba(255,190,110,0.95)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, 32, 32);
        return new THREE.CanvasTexture(canvas2);
      });
      const backgroundParticles = [];
      for(let i=0;i<70;i++){
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map:codeTextures[Math.floor(Math.random()*codeTextures.length)],transparent:true,opacity:0.75,depthWrite:false}));
        sprite.position.set((Math.random()-0.5)*20,(Math.random()-0.5)*12,(Math.random()-0.5)*10);
        sprite.scale.set(0.4 + Math.random()*0.5,0.4 + Math.random()*0.5,1);
        sprite.userData.speed = 0.01 + Math.random()*0.02;
        sprite.userData.baseX = sprite.position.x;
        backgroundParticles.push(sprite);
        scene.add(sprite);
      }
      function resize(){
        if(renderer && camera){
          renderer.setSize(window.innerWidth,window.innerHeight);
          camera.aspect = window.innerWidth/window.innerHeight;
          camera.updateProjectionMatrix();
        }
      }
      window.addEventListener('resize',resize);
      resize();
      clock = new THREE.Clock();
      const animate = ()=>{
        requestAnimationFrame(animate);
        if(!renderer || !scene || !camera || !tor || !ring) return;
        const t = clock.getElapsedTime();
        tor.rotation.x = Math.sin(t * 0.16) * 0.03 + 0.03;
        tor.rotation.y = Math.cos(t * 0.12) * 0.03 + 0.02;
        tor.position.y = Math.sin(t * 0.7) * 0.028;
        tor.position.x = Math.sin(t * 0.18) * 0.03;
        ring.rotation.z = Math.cos(t * 0.08) * 0.03;
        ring.material.opacity = 0.18 + Math.sin(t * 0.3) * 0.02;
        camera.position.x += (0 - camera.position.x) * 0.04;
        camera.position.y += (0 - camera.position.y) * 0.04;
        camera.lookAt(0,0,0);
        if(tor.userData.modules){
          tor.userData.modules.forEach((module,index)=>{
            const offset = index * 0.18;
            module.rotation.x += 0.0015 + Math.sin(t + offset) * 0.0007;
            module.rotation.y += 0.0015 + Math.cos(t + offset) * 0.0007;
          });
        }
        if(tor.userData.core){
          const pulse = 1 + Math.sin(t * 1.6) * 0.005;
          tor.userData.core.scale.setScalar(pulse);
        }
        backgroundParticles.forEach((particle,index)=>{
          const glowScale = 1 + Math.sin(t * 0.75 + index) * 0.015;
          particle.material.opacity = 0.18 + Math.sin(t * 0.75 + index) * 0.02;
          particle.scale.set(glowScale * particle.scale.x, glowScale * particle.scale.y, 1);
          particle.position.y += particle.userData.speed * 0.16;
          particle.position.x = particle.userData.baseX + Math.sin(t * 0.06 + index) * 0.06;
          if(particle.position.y > 8) particle.position.y = -8;
        });
        renderer.render(scene,camera);
      };
      animate();
    }catch(err){
      console.warn('Three.js animation failed to initialize:', err);
      if(canvas) canvas.style.display='none';
    }
  } else if(canvas){
    canvas.style.display='none';
  }

  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-inner',{y:20,opacity:0,duration:1,ease:'power1.out'});
    gsap.utils.toArray('.section').forEach(section=>{
      gsap.from(section,{y:16,opacity:0,duration:0.9,ease:'power1.out',scrollTrigger:{trigger:section,start:'top 85%'}});
    });
  }

  const projectsKey = 'mmm_projects_v1';
  const savedProjects = JSON.parse(localStorage.getItem(projectsKey) || 'null');
  const projects = savedProjects || [
    {id:Date.now(),name:'Student Portal',desc:'A learning tracker and portfolio dashboard.',stack:['HTML','CSS','JS'],completion:45,status:'Development',link:'https://mmm-example.com',github:'https://github.com/mm-muhammadh',image:''},
    {id:Date.now()+1,name:'AI Study Bot',desc:'A student assistant for notes and coding practice.',stack:['Python','JS'],completion:20,status:'Planning',link:'https://mmm-example.com',github:'https://github.com/mm-muhammadh',image:''},
  ];
  const grid = document.getElementById('projectsGrid');
  const formWrapper = document.getElementById('projectForm');
  const toggleForm = document.getElementById('toggleProjectForm');
  const removeProjectBtn = document.getElementById('removeProject');
  const saveProjectBtn = document.getElementById('saveProject');
  const completionValue = document.getElementById('completionValue');
  const projectCompletion = document.getElementById('projectCompletion');
  const chooseImageBtn = document.getElementById('chooseProjectImage');
  const imageFileInput = document.getElementById('projectImageInput');
  const imageFileName = document.getElementById('imageFileName');
  let selectedProjectId = null;
  let selectedImageData = '';
  const fields = {
    name: document.getElementById('projectName'),
    stack: document.getElementById('projectStack'),
    image: document.getElementById('projectImage'),
    github: document.getElementById('projectGithub'),
    link: document.getElementById('projectLink'),
    description: document.getElementById('projectDescription'),
    status: document.getElementById('projectStatus'),
    completion: projectCompletion,
  };

  function persist(){localStorage.setItem(projectsKey,JSON.stringify(projects));}
  const featuredProjectContainer = document.getElementById('featuredProject');

  function renderProjects(){
    const [latestProject, ...otherProjects] = projects;
    if(latestProject){
      featuredProjectContainer.classList.remove('hidden');
      featuredProjectContainer.innerHTML = `
        <div class="project-meta">
          <span class="status-badge">${latestProject.status}</span>
          <span>${latestProject.stack.join(', ')}</span>
        </div>
        ${latestProject.image ? `<img class="project-image" src="${latestProject.image}" alt="${latestProject.name} image" />` : ''}
        <h3>${latestProject.name}</h3>
        <p>${latestProject.desc}</p>
        <div class="progress-wrap"><div class="progress-label"><span>Completion</span><strong>${latestProject.completion}%</strong></div><div class="progress-bar"><div class="progress-inner" style="width:${latestProject.completion}%"></div></div></div>
        <div class="project-actions">
          ${latestProject.link ? `<a href="${latestProject.link}" target="_blank" class="btn">Visit</a>` : ''}
          ${latestProject.github ? `<a href="${latestProject.github}" target="_blank" class="btn">GitHub</a>` : ''}
        </div>
      `;
    } else {
      featuredProjectContainer.classList.add('hidden');
      featuredProjectContainer.innerHTML = '';
    }

    grid.innerHTML='';
    otherProjects.forEach(project=>{
      const card=document.createElement('article');
      card.className = 'project-card' + (selectedProjectId === project.id ? ' selected' : '');
      card.innerHTML = `
        <div class="project-meta">
          <label class="project-select-wrap">
            <input type="radio" name="selectedProject" class="project-select" value="${project.id}" ${selectedProjectId === project.id ? 'checked' : ''} />
            <span>Select</span>
          </label>
          <span class="status-badge">${project.status}</span>
          <span>${project.stack.join(', ')}</span>
        </div>
          ${project.image ? `<img class="project-image" src="${project.image}" alt="${project.name} image" />` : ''}
        <h3>${project.name}</h3>
        <p>${project.desc}</p>
        <div class="progress-wrap"><div class="progress-label"><span>Completion</span><strong>${project.completion}%</strong></div><div class="progress-bar"><div class="progress-inner" style="width:${project.completion}%"></div></div></div>
        <div class="project-actions">
          ${project.link ? `<a href="${project.link}" target="_blank" class="btn">Visit</a>` : ''}
          ${project.github ? `<a href="${project.github}" target="_blank" class="btn">GitHub</a>` : ''}
          <button class="btn update-btn" data-id="${project.id}">Update</button>
        </div>
        <div class="update-panel hidden" id="update-${project.id}">
          <label>Completion: <span class="update-value">${project.completion}%</span></label>
          <input type="range" min="0" max="100" value="${project.completion}" class="project-slider" data-id="${project.id}" />
          <select class="project-status" data-id="${project.id}">
            <option${project.status==='Planning'?' selected':''}>Planning</option>
            <option${project.status==='Development'?' selected':''}>Development</option>
            <option${project.status==='Testing'?' selected':''}>Testing</option>
            <option${project.status==='Completed'?' selected':''}>Completed</option>
          </select>
        </div>
      `;
      grid.appendChild(card);
    });
    document.querySelectorAll('.update-btn').forEach(btn=>btn.addEventListener('click',()=>{
      const panel=document.getElementById('update-'+btn.dataset.id);
      panel.classList.toggle('hidden');
    }));
    document.querySelectorAll('.project-select').forEach(input=>{
      input.addEventListener('change',()=>{
        selectedProjectId = Number(input.value);
        removeProjectBtn.disabled = false;
        renderProjects();
      });
    });
    document.querySelectorAll('.project-slider').forEach(input=>{
      input.addEventListener('input',()=>{const id=Number(input.dataset.id);const item=projects.find(p=>p.id===id);if(item){item.completion=Number(input.value);input.closest('.update-panel').querySelector('.update-value').textContent=`${item.completion}%`;renderProjects();persist();}});
    });
    document.querySelectorAll('.project-status').forEach(select=>{
      select.addEventListener('change',()=>{const id=Number(select.dataset.id);const item=projects.find(p=>p.id===id);if(item){item.status=select.value;renderProjects();persist();}});
    });
  }

  let isAuthorizedToAddProject = false;

  function requestProjectAccess(){
    if(isAuthorizedToAddProject) return true;
    const userName = window.prompt('Enter your name to add a project:');
    if(userName === null) return false;
    const userPassword = window.prompt('Enter the password to add a project:');
    if(userPassword === null) return false;
    if(userName.trim() === 'Muhammadh' && userPassword === 'Mhmd4271'){
      isAuthorizedToAddProject = true;
      return true;
    }
    alert('Access denied. Incorrect name or password.');
    return false;
  }

  renderProjects();
  removeProjectBtn.disabled = true;
  removeProjectBtn.addEventListener('click',()=>{
    if(!selectedProjectId){return;}
    const index = projects.findIndex(p=>p.id===selectedProjectId);
    if(index !== -1){
      projects.splice(index,1);
      selectedProjectId = null;
      persist();
      renderProjects();
      removeProjectBtn.disabled = true;
    }
  });
  toggleForm.addEventListener('click',()=>{
    if(!requestProjectAccess()) return;
    formWrapper.classList.toggle('hidden');
    toggleForm.classList.toggle('primary');
  });
  projectCompletion.addEventListener('input',()=>{completionValue.textContent=`${projectCompletion.value}%`;});

  chooseImageBtn.addEventListener('click',()=>{imageFileInput.click();});
  imageFileInput.addEventListener('change',()=>{
    const file = imageFileInput.files?.[0];
    if(!file){imageFileName.textContent = 'No image selected'; fields.image.value = ''; selectedImageData = ''; return;}
    imageFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = ()=>{
      selectedImageData = reader.result.toString();
      fields.image.value = selectedImageData;
    };
    reader.readAsDataURL(file);
  });

  saveProjectBtn.addEventListener('click',()=>{
    const name = fields.name.value.trim();
    const stack = fields.stack.value.trim();
    const image = fields.image.value.trim();
    const github = fields.github.value.trim();
    const link = fields.link.value.trim();
    const desc = fields.description.value.trim();
    const status = fields.status.value;
    const completion = Number(fields.completion.value);
    if(!name || !desc || !stack){alert('Please complete all project fields');return;}
    if(imageFileInput.files.length && !image){alert('Please wait for the image to finish loading');return;}
    projects.unshift({id:Date.now(),name,desc,stack:stack.split(',').map(s=>s.trim()),completion,status,link,github,image,isNew:true});
    persist();
    renderProjects();
    fields.name.value='';fields.stack.value='';fields.image.value='';fields.github.value='';fields.link.value='';fields.description.value='';fields.completion.value=50;completionValue.textContent='50%';fields.status.value='Planning';
    selectedImageData = '';
    imageFileInput.value = '';
    imageFileName.textContent = 'No image selected';
    formWrapper.classList.add('hidden');
  });

  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit',e=>{
    e.preventDefault();
    const nameVal = document.getElementById('name').value.trim();
    const emailVal = document.getElementById('email').value.trim();
    const messageVal = document.getElementById('message').value.trim();
    if(!nameVal || !emailVal || !messageVal){
      alert('Please fill in all contact fields.');
      return;
    }
    const subject = encodeURIComponent(`Portfolio message from ${nameVal}`);
    const body = encodeURIComponent(`Name: ${nameVal}\nEmail: ${emailVal}\n\n${messageVal}`);
    window.location.href = `mailto:mhmdmunas92@gmail.com?subject=${subject}&body=${body}`;
    contactForm.reset();
  });

  const themeBtn = document.getElementById('themeToggle');
  const updateThemeLabel = ()=>{themeBtn.textContent = document.documentElement.classList.contains('light-mode') ? 'Dark Mode' : 'Bright Mode';};
  themeBtn.addEventListener('click',()=>{document.documentElement.classList.toggle('light-mode');updateThemeLabel();});
  updateThemeLabel();
});
