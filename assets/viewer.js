import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {VoicePlayer} from './native-sound.js?v=3';

const names=['viseme_PP','viseme_AA','viseme_E','viseme_I','viseme_O','viseme_U','viseme_FV','viseme_L'];
const poses={X:[0,0,0,0,0,0,0,0],A:[.7,0,0,0,0,0,0,0],B:[0,0,0,.65,0,0,0,0],C:[0,0,.65,0,0,0,0,0],D:[0,.75,0,0,0,0,0,0],E:[0,0,0,0,.65,0,0,0],F:[0,0,0,0,0,.7,0,0],G:[0,0,0,0,0,0,.65,0],H:[0,.1,0,0,0,0,0,.25]};
const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};

export async function mount(element,assetBase){
 const stage=element.querySelector('.avatar-stage'),status=element.querySelector('.avatar-status');
 const scene=new THREE.Scene();scene.background=new THREE.Color('#dce6f0');
 const renderer=new THREE.WebGLRenderer({antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 stage.appendChild(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(32,1,.02,30);
 const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.enablePan=false;
 orbit.minDistance=.65;orbit.maxDistance=4;orbit.minPolarAngle=.3;orbit.maxPolarAngle=Math.PI*.72;
 scene.add(new THREE.HemisphereLight(0xfff6ef,0x5e6e87,2));
 const key=new THREE.DirectionalLight(0xfff2e7,2.2);key.position.set(-2,3,4);scene.add(key);
 const fill=new THREE.DirectionalLight(0xe0ecff,1.2);fill.position.set(2,2,2);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xffffff,1.6);rim.position.set(1,3,-3);scene.add(rim);
 const gltf=await new GLTFLoader().loadAsync(assetBase+'/avatar-falante.glb');
 const avatar=gltf.scene;avatar.rotation.y=.45;scene.add(avatar);const meshes=[];
 avatar.traverse(obj=>{if(obj.isMesh){obj.frustumCulled=false;meshes.push(obj);if(obj.material){for(const mat of Array.isArray(obj.material)?obj.material:[obj.material]){mat.metalness=0;mat.roughness=Math.max(mat.roughness,.6);}}}});
 const mixer=new THREE.AnimationMixer(avatar);
 for(const clip of gltf.animations){
  // Voice morphs are controlled by the audio clock, independently of the body clip.
  const bodyClip=clip.clone();bodyClip.tracks=bodyClip.tracks.filter(track=>!track.name.includes('morphTargetInfluences'));
  if(bodyClip.tracks.length)mixer.clipAction(bodyClip).play();
 }
 mixer.update(0);avatar.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(avatar),center=box.getCenter(new THREE.Vector3());
 const head=avatar.getObjectByName('Head');const face=head?head.getWorldPosition(new THREE.Vector3()):new THREE.Vector3(center.x,box.max.y-.2,center.z);
 const homeTarget=new THREE.Vector3(face.x,face.y+.005,face.z),homePosition=homeTarget.clone().add(new THREE.Vector3(0,.055,1.25));
 function home(){spinStart=null;camera.position.copy(homePosition);orbit.target.copy(homeTarget);orbit.update();}
 let spinStart=null,spinAngle=0,spinRadius=1.25,spinHeight=.055;home();
 const audio=new VoicePlayer();let cues=[],phase='idle',manualPose=null;
 const labels={idle:'Estou aqui com você',thinking:'Estou pensando…',preparing:'Preparando minha voz…',speaking:'Conversando com você',transcribing:'Estou ouvindo…'};
 function setStatus(value){phase=value;status.textContent=labels[value]||value;}
 function stop(){audio.stop();cues=[];setStatus('idle');}
 function beginSpeech(){stop();audio.beginStream();setStatus('preparing');}
 function appendSpeech(payload){cues.push(...(payload.cues||[]));audio.enqueuePCM(payload.audio_base64,payload.sample_rate,payload.offset);}
 function update(payload){stop();setStatus(payload?.phase||'idle');}
 function mouthAt(t){
  let lo=0,hi=cues.length;while(lo<hi){const mid=(lo+hi)>>1;if(cues[mid].end<=t)lo=mid+1;else hi=mid;}
  const cue=cues[lo];if(!cue||t<cue.start)return poses.X;
  const current=poses[cue.value]||poses.X,previous=poses[cues[lo-1]?.value]||poses.X;
  const f=smooth((t-cue.start)/Math.min(.055,(cue.end-cue.start)*.45));return current.map((v,i)=>previous[i]*(1-f)+v*f);
 }
 audio.addEventListener('playing',()=>setStatus('speaking'));audio.addEventListener('ended',()=>setStatus('idle'));
 function spin(){const offset=camera.position.clone().sub(orbit.target);spinRadius=Math.hypot(offset.x,offset.z);spinHeight=offset.y;spinStart=performance.now()/1000;spinAngle=orbit.getAzimuthalAngle();}
 element.querySelector('.avatar-spin')?.addEventListener('click',spin);
 orbit.addEventListener('start',()=>spinStart=null);
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(stage);resize();
 let previous=performance.now(),blinkStart=-10,nextBlink=previous/1000+2.6,frames=0,measure=previous,fps=60;
 const influence=Array(8).fill(0);
 function frame(now){
  if(!element.isConnected){audio.stop();observer.disconnect();orbit.dispose();renderer.dispose();return;}
  requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;if(document.hidden)return;
  const t=now/1000;mixer.update(dt);
  if(t>=nextBlink){blinkStart=t;nextBlink=t+3+Math.random()*3;}
  const bt=t-blinkStart;const blink=bt<.08?smooth(bt/.08):bt<.115?1:bt<.25?1-smooth((bt-.115)/.135):0;
  const target=manualPose?names.map(name=>manualPose[name]||0):audio.paused?poses.X:mouthAt(audio.currentTime);
  const blend=1-Math.exp(-dt*28);for(let i=0;i<8;i++)influence[i]+=(target[i]-influence[i])*blend;
  for(const mesh of meshes){const dict=mesh.morphTargetDictionary,values=mesh.morphTargetInfluences;if(!dict||!values)continue;
   for(let i=0;i<8;i++)if(dict[names[i]]!==undefined)values[dict[names[i]]]=influence[i];
   if(dict.Blink!==undefined)values[dict.Blink]=manualPose?manualPose.Blink||0:blink;
   if(dict.Smile!==undefined)values[dict.Smile]=0;
  }
  if(spinStart!==null){
   const progress=(t-spinStart)/7,angle=spinAngle+smooth(progress)*Math.PI*2;
   camera.position.set(orbit.target.x+Math.sin(angle)*spinRadius,orbit.target.y+spinHeight,orbit.target.z+Math.cos(angle)*spinRadius);
   if(progress>=1)spinStart=null;
  }
  orbit.update();renderer.render(scene,camera);frames++;
  if(now-measure>2000){fps=frames*1000/(now-measure);frames=0;measure=now;if(fps<35&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);resize();}}
 }
 requestAnimationFrame(frame);setStatus('idle');
 const controller={update,stop,beginSpeech,appendSpeech,endSpeech:()=>audio.finish(),unlock:()=>audio.unlock(),audio,meshes,scene,camera,renderer,orbit,home,spin,
  inspect:()=>({fps,triangles:renderer.info.render.triangles,animations:gltf.animations.map(a=>a.name),morphMeshes:meshes.filter(m=>m.morphTargetDictionary).length,phase}),
  pose:weights=>manualPose=weights};
 window.avatarViewer=controller;return controller;
}
