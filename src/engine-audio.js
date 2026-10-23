// Procedural fallback, not a recording of a Toyota or any other real vehicle.
// Eight combustion pulses per 720-degree four-stroke cycle: firing Hz = RPM / 15.
// Native Web Audio nodes avoid an audio worklet, streaming, or per-sample JS work.
class TurboDieselV8Sound {
 constructor(ctx,noiseBuffer){
  this.ctx=ctx;this.spool=0;this.lastTime=ctx.currentTime;this.rpm=750;
  this.exhaust=ctx.createOscillator();
  const real=new Float32Array(65),imag=new Float32Array(65),pulses=[1,.72,.86,.77,.92,.70,.88,.78];
  for(let n=1;n<real.length;n++)for(let i=0;i<8;i++){
   const a=2*Math.PI*n*i/8,weight=pulses[i]*Math.exp(-((n/28)**2))/8;
   real[n]+=Math.cos(a)*weight;imag[n]-=Math.sin(a)*weight;
  }
  this.exhaust.setPeriodicWave(ctx.createPeriodicWave(real,imag));
  this.exhaust.frequency.value=750/120;
  this.body=ctx.createBiquadFilter();this.body.type='lowpass';this.body.Q.value=.7;this.body.frequency.value=550;
  const rumbleCut=ctx.createBiquadFilter();rumbleCut.type='highpass';rumbleCut.frequency.value=25;
  this.exhaustGain=ctx.createGain();this.exhaustGain.gain.value=0;
  this.exhaust.connect(this.body);this.body.connect(rumbleCut);rumbleCut.connect(this.exhaustGain);this.exhaustGain.connect(ctx.destination);
  this.turbo=ctx.createOscillator();this.turbo.type='sine';this.turbo.frequency.value=800;
  this.turboGain=ctx.createGain();this.turboGain.gain.value=0;this.turbo.connect(this.turboGain);this.turboGain.connect(ctx.destination);
  this.air=ctx.createBufferSource();this.air.buffer=noiseBuffer;this.air.loop=true;
  this.airBand=ctx.createBiquadFilter();this.airBand.type='bandpass';this.airBand.frequency.value=1800;this.airBand.Q.value=.7;
  this.airGain=ctx.createGain();this.airGain.gain.value=0;this.air.connect(this.airBand);this.airBand.connect(this.airGain);this.airGain.connect(ctx.destination);
  this.exhaust.start();this.turbo.start();this.air.start();
 }
 update(rpm,load,volume,active){
  const t=this.ctx.currentTime,dt=Math.max(0,Math.min(.1,t-this.lastTime));this.lastTime=t;
  if(!active){this.stop();return;}
  this.rpm=Math.max(750,Math.min(4200,Number.isFinite(rpm)?rpm:750));
  load=Math.max(0,Math.min(1,load));volume=Math.max(0,Math.min(1,volume));
  const target=load*Math.max(0,Math.min(1,(this.rpm-1100)/1800));
  this.spool+=(target-this.spool)*(1-Math.exp(-dt/(target>this.spool?.7:1.1)));
  this.exhaust.frequency.setTargetAtTime(this.rpm/120,t,.045);
  this.body.frequency.setTargetAtTime(480+load*850+(this.rpm-750)*.09,t,.09);
  this.exhaustGain.gain.setTargetAtTime((.11+load*.11)*volume,t,.06);
  this.turbo.frequency.setTargetAtTime(800+this.spool*2200,t,.12);
  this.turboGain.gain.setTargetAtTime(.012*this.spool*volume,t,.10);
  this.airBand.frequency.setTargetAtTime(1800+this.spool*1700,t,.10);
  this.airGain.gain.setTargetAtTime(.04*this.spool*volume,t,.10);
 }
 stop(){
  this.spool=0;this.lastTime=this.ctx.currentTime;
  for(const node of [this.exhaustGain,this.turboGain,this.airGain])node.gain.setTargetAtTime(0,this.lastTime,.04);
 }
}
