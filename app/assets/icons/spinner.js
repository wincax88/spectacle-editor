import React, { Component, PropTypes } from "react";

class Spinner extends Component {
  static propTypes = {
    className: PropTypes.string
  };

  componentDidMount() {
      /* Created a spinner using SVG Circus http://svgcircus.com/ */
      /* eslint-disable */
      var actors={};
      actors.actor_1={node:document.getElementById("SVG-Circus-a475b338-504e-f312-5218-91b9bc643dc8").getElementById("actor_1"),type:"circle",cx:30,cy:50,dx:8,dy:33,opacity:1};
      actors.actor_2={node:document.getElementById("SVG-Circus-a475b338-504e-f312-5218-91b9bc643dc8").getElementById("actor_2"),type:"circle",cx:30,cy:50,dx:8,dy:33,opacity:0.75};
      actors.actor_3={node:document.getElementById("SVG-Circus-a475b338-504e-f312-5218-91b9bc643dc8").getElementById("actor_3"),type:"circle",cx:30,cy:50,dx:8,dy:33,opacity:0.5};
      actors.actor_4={node:document.getElementById("SVG-Circus-a475b338-504e-f312-5218-91b9bc643dc8").getElementById("actor_4"),type:"circle",cx:30,cy:50,dx:8,dy:33,opacity:0.3};
      actors.actor_5={node:document.getElementById("SVG-Circus-a475b338-504e-f312-5218-91b9bc643dc8").getElementById("actor_5"),type:"circle",cx:30,cy:50,dx:7,dy:33,opacity:0.25};
      var tricks={};
      tricks.trick_1=(function(_,t){t=(function(t){return.5*(1-Math.cos(Math.PI*t))})(t)%1,t=t*4%1,t=0>t?1+t:t;
      var a=(_.node,-20*Math.cos(180*Math.PI/180)),i=20*Math.sin(180*Math.PI/180);
      a+=20*Math.cos((180-360*t*1)*Math.PI/180),i-=20*Math.sin((180-360*t*1)*Math.PI/180),_._tMatrix[4]+=a,_._tMatrix[5]+=i});
      tricks.trick_2=(function(t,i){i=(function(n){return.5>n?2*n*n:-1+(4-2*n)*n})(i)%1,i=0>i?1+i:i;var _=t.node;0.1>=i?_.setAttribute("opacity",i*(t.opacity/0.1)):i>=0.9?_.setAttribute("opacity",t.opacity-(i-0.9)*(t.opacity/(1-0.9))):_.setAttribute("opacity",t.opacity)});
      var scenarios={};
      scenarios.scenario_1={actors: ["actor_1","actor_2","actor_3","actor_4","actor_5"],tricks: [{trick: "trick_1",start:0,end:1.00},{trick: "trick_2",start:0,end:1}],startAfter:0,duration:8000,actorDelay:200,repeat:0,repeatDelay:0};
      var _reqAnimFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.oRequestAnimationFrame,fnTick=function(t){var r,a,i,e,n,o,s,c,m,f,d,k,w;for(c in actors)actors[c]._tMatrix=[1,0,0,1,0,0];for(s in scenarios)for(o=scenarios[s],m=t-o.startAfter,r=0,a=o.actors.length;a>r;r++){if(i=actors[o.actors[r]],i&&i.node&&i._tMatrix)for(f=0,m>=0&&(d=o.duration+o.repeatDelay,o.repeat>0&&m>d*o.repeat&&(f=1),f+=m%d/o.duration),e=0,n=o.tricks.length;n>e;e++)k=o.tricks[e],w=(f-k.start)*(1/(k.end-k.start)),tricks[k.trick]&&tricks[k.trick](i,Math.max(0,Math.min(1,w)));m-=o.actorDelay}for(c in actors)i=actors[c],i&&i.node&&i._tMatrix&&i.node.setAttribute("transform","matrix("+i._tMatrix.join()+")");_reqAnimFrame(fnTick)};_reqAnimFrame(fnTick);
      /* eslint-enable */
  }

  render() {
    const { className } = this.props;

    return (
      <svg
        className={ className }
        id="SVG-Circus-a475b338-504e-f312-5218-91b9bc643dc8"
        version="1.1"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle id="actor_5" cx="30" cy="50" r="3.5" opacity="0.25"
          fill="rgba(50,57,61,1)" fillOpacity="1"
          stroke="rgba(255,255,255,1)" strokeWidth="0" strokeOpacity="1" strokeDasharray=""
        >
        </circle>
        <circle id="actor_4" cx="30" cy="50" r="4" opacity="0.5"
          fill="rgba(50,57,61,1)" fillOpacity="1"
          stroke="rgba(255,255,255,1)" strokeWidth="0" strokeOpacity="1" strokeDasharray=""
        >
        </circle>
        <circle id="actor_3" cx="30" cy="50" r="4" opacity="0.5"
          fill="rgba(50,57,61,1)" fillOpacity="1"
          stroke="rgba(255,255,255,1)" strokeWidth="0" strokeOpacity="1" strokeDasharray=""
        >
        </circle>
        <circle id="actor_2" cx="30" cy="50" r="4" opacity="0.75"
          fill="rgba(50,57,61,1)" fillOpacity="1"
          stroke="rgba(255,255,255,1)" strokeWidth="0" strokeOpacity="1" strokeDasharray=""
        >
        </circle>
        <circle id="actor_1" cx="30" cy="50" r="4" opacity="1" fill="rgba(50,57,61,1)"
          fillOpacity="1"
          stroke="rgba(255,255,255,1)" strokeWidth="0" strokeOpacity="1" strokeDasharray=""
        >
        </circle>
      </svg>
    );
  }
}

export default Spinner;
