/* ==========================================================================
   MOTOCREWZ — FILM N° 002
   A scroll-driven 3D study of the Vulcan 02.

   React renders the chapter overlay and the HUD.
   Three.js builds and lights the machine.
   GSAP ScrollTrigger scrubs the camera, the exploded view and the copy.

   Additive by design: if WebGL, Three.js or React is unavailable the section
   falls back to a photographic poster and the rest of the site is untouched.
   Reduced-motion visitors get the same story as a static spread.
   ========================================================================== */
(function () {
  "use strict";

  var section = document.getElementById("story");
  var root = document.getElementById("storyRoot");
  if (!section || !root) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var spreadMode = reducedMotion || !(window.gsap && window.ScrollTrigger);
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hasReact = !!(window.React && window.ReactDOM && window.ReactDOM.createRoot && window.htm);
  var hasThree = !!window.THREE;

  /* No React at all — keep the hand-written poster already in the page. */
  if (!hasReact) {
    section.classList.add("is-fallback", "is-static");
    return;
  }

  var html = window.htm.bind(window.React.createElement);

  /* ---------------------------------------------------------------------- */
  /* Copy                                                                    */
  /* ---------------------------------------------------------------------- */

  var CHAPTERS = [
    {
      id: "form",
      n: "01",
      rail: "Form",
      kicker: "The form",
      title: html`A shape<br /><em>with a reason.</em>`,
      body:
        "Every Motocrewz begins as a chalk line on the workshop floor. Proportion first, decoration later — the rest is one long conversation.",
      meta: "Vulcan 02 · 900 cc · 198 kg",
    },
    {
      id: "parts",
      n: "02",
      rail: "Parts",
      kicker: "The parts",
      title: html`Built<br /><em>piece by piece.</em>`,
      body:
        "Frame, tank, engine, exhaust. Four hundred and twelve parts, one bench, and a rule we do not break: nothing leaves until it earns the badge.",
      meta: "412 parts · 1 bench · 0 shortcuts",
    },
    {
      id: "finish",
      n: "03",
      rail: "Finish",
      kicker: "The finish",
      title: html`The finish<br /><em>is the promise.</em>`,
      body:
        "Oxblood laid by hand, cream pinstripes cut by eye, a badge brushed in the last hour. Paint is the one part we refuse to rush.",
      meta: "Oxblood / cream · hand-mixed",
    },
    {
      id: "road",
      n: "04",
      rail: "Road",
      kicker: "The road",
      title: html`Then it's<br /><em>yours.</em>`,
      body:
        "Eighteen Vulcans leave the garage each year. Each one numbered, each one set up for the person who will ride it home.",
      meta: "No. 02 / 18 · Lisbon",
      cta: true,
    },
  ];
  /* ---------------------------------------------------------------------- */
  /* React experience                                                        */
  /* ---------------------------------------------------------------------- */

  function StoryExperience() {
    var activeState = window.React.useState(0);
    var active = activeState[0];
    var setActive = activeState[1];
    var modeState = window.React.useState(hasThree ? "live" : "fallback");
    var mode = modeState[0];
    var setMode = modeState[1];

    var hostRef = window.React.useRef(null);
    var meterRef = window.React.useRef(null);
    var pctRef = window.React.useRef(null);
    var activeRef = window.React.useRef(0);

    window.React.useEffect(function () {
      var scene = null;
      var trigger = null;
      
      if (mode === "live" && hostRef.current) {
        try {
          scene = createScene(hostRef.current);
        } catch (error) {
          if (window.console) console.warn("Motocrewz film: WebGL unavailable.", error);
          section.classList.add("is-fallback");
          setMode("fallback");
          return undefined;
        }
      }

      function paintUi(progress) {
        var p = Math.max(0, Math.min(1, progress || 0));
        if (meterRef.current) meterRef.current.style.transform = "scaleX(" + p.toFixed(4) + ")";
        if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
        var next = p >= 0.78 ? 3 : p >= 0.53 ? 2 : p >= 0.27 ? 1 : 0;
        if (next !== activeRef.current) {
          activeRef.current = next;
          setActive(next);
        }
      }

      if (spreadMode) {
        section.classList.add("is-static");
        if (scene) {
          /* The static spread is shorter than the pinned film, so the scene
             must be re-sized after the class change or the render is squashed. */
          scene.resize();
          scene.setProgress(0.58, true);
          scene.renderStatic();
        }
        paintUi(1);
        return function () {
          section.classList.remove("is-static");
          if (scene) scene.dispose();
        };
      }

      if (window.gsap && window.ScrollTrigger) {
        trigger = window.ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: function (self) {
            if (scene) scene.setProgress(self.progress);
            paintUi(self.progress);
          },
          onRefresh: function (self) {
            if (scene) scene.setProgress(self.progress, true);
            paintUi(self.progress);
          },
        });
        if (scene) scene.setProgress(trigger.progress, true);
        paintUi(trigger.progress);
        window.ScrollTrigger.refresh();
      }

      return function () {
        if (trigger) trigger.kill();
        if (scene) scene.dispose();
        section.classList.remove("is-static");
      };
    }, [mode]);

    var poster = mode === "fallback";

    return html`
      <div className="story__sticky">
        <div className="story__scene" ref=${hostRef} aria-hidden="true">
          ${poster &&
          html`<img className="story__poster" src="assets/p2.jpg" alt="" loading="lazy" decoding="async" />`}
        </div>
        <div className="story__veil" aria-hidden="true"></div>
        <div className="story__ghost" aria-hidden="true">VULCAN</div>

        <div className="story__top">
          <span className="story__brand"><i aria-hidden="true"></i>Motocrewz — Film N° 002</span>
          <span className="story__spec">Vulcan 02 · Lisbon · 38°43′N</span>
        </div>

        <div className="story__rail" aria-hidden="true">
          ${CHAPTERS.map(function (chapter, index) {
            return html`<span className="story__tick" data-on=${index === active} key=${chapter.id}>
              <b>${chapter.n}</b><span>${chapter.rail}</span>
            </span>`;
          })}
        </div>

        <div className="story__chapters">
          ${CHAPTERS.map(function (chapter, index) {
            var isActive = index === active;
            return html`<article
              className="story__chapter"
              data-active=${isActive}
              aria-hidden=${spreadMode ? "false" : String(!isActive)}
              key=${chapter.id}
            >
              <p className="story__kicker">${chapter.n} — ${chapter.kicker}</p>
              <h2 className="story__title">${chapter.title}</h2>
              <p className="story__body">${chapter.body}</p>
              <p className="story__meta">${chapter.meta}</p>
              ${chapter.cta &&
              html`<div className="story__actions">
                <a href="#join" className="story__btn">Book a build <span aria-hidden="true">↗</span></a>
                <a href="#lineup" className="story__btn story__btn--ghost">See the line-up</a>
              </div>`}
              ${index === 0 &&
              html`<span className="story__scroll" aria-hidden="true"><i></i>Scroll to build</span>`}
            </article>`;
          })}
        </div>

        <div className="story__hud">
          <span className="story__hud-label">Build progress</span>
          <span className="story__meter"><i ref=${meterRef}></i></span>
          <span className="story__pct"><b ref=${pctRef}>000</b> / 100</span>
          <span className="story__hint">Real-time 3D</span>
        </div>
      </div>
    `;
  }

  var reactRoot = window.ReactDOM.createRoot(root);
  reactRoot.render(html`<${StoryExperience} />`);
  /* ---------------------------------------------------------------------- */
  /* Three.js scene                                                          */
  /* ---------------------------------------------------------------------- */

  function createScene(host) {
    var THREE = window.THREE;
    var clockStart = performance.now();
    var narrow = window.innerWidth < 860;
    var staticMode = false;

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0908, 14, 34);

    var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    var cameraLook = new THREE.Vector3(0, 0.72, 0);

    var renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearAlpha(0);
    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 1.8));
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    /* -- helpers ---------------------------------------------------------- */

    function smoothstep(t) {
      var x = Math.max(0, Math.min(1, t));
      return x * x * (3 - 2 * x);
    }

    function mix(a, b, t) {
      return a + (b - a) * t;
    }

    function mix3(a, b, t) {
      return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
    }

    function tube(a, b, radius, material) {
      var start = new THREE.Vector3(a[0], a[1], a[2]);
      var end = new THREE.Vector3(b[0], b[1], b[2]);
      var direction = new THREE.Vector3().subVectors(end, start);
      var length = direction.length();
      var geometry = new THREE.CylinderGeometry(radius, radius, length, 12, 1);
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      return mesh;
    }

    function radialTexture(stops) {
      var size = 256;
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      var context = canvas.getContext("2d");
      var gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      stops.forEach(function (stop) {
        gradient.addColorStop(stop[0], stop[1]);
      });
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
      var texture = new THREE.CanvasTexture(canvas);
      if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    /* A tiny procedural studio so the metal and paint have something to
       reflect. Without it, metallic surfaces render almost black. */
    function studioEnvironment() {
      var canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      var context = canvas.getContext("2d");

      var sky = context.createLinearGradient(0, 0, 0, 256);
      sky.addColorStop(0, "#fbf5e9");
      sky.addColorStop(0.34, "#cdc1b0");
      sky.addColorStop(0.5, "#7d7064");
      sky.addColorStop(0.68, "#2e241d");
      sky.addColorStop(1, "#0a0807");
      context.fillStyle = sky;
      context.fillRect(0, 0, 512, 256);

      var warm = context.createRadialGradient(96, 132, 0, 96, 132, 210);
      warm.addColorStop(0, "rgba(255,150,92,0.95)");
      warm.addColorStop(0.45, "rgba(216,85,43,0.34)");
      warm.addColorStop(1, "rgba(216,85,43,0)");
      context.fillStyle = warm;
      context.fillRect(0, 0, 512, 256);

      var cool = context.createRadialGradient(400, 74, 0, 400, 74, 180);
      cool.addColorStop(0, "rgba(214,226,240,0.7)");
      cool.addColorStop(1, "rgba(214,226,240,0)");
      context.fillStyle = cool;
      context.fillRect(0, 0, 512, 256);

      var source = new THREE.CanvasTexture(canvas);
      source.mapping = THREE.EquirectangularReflectionMapping;
      if (THREE.SRGBColorSpace) source.colorSpace = THREE.SRGBColorSpace;

      var pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      var envMap = pmrem.fromEquirectangular(source).texture;
      pmrem.dispose();
      source.dispose();
      return envMap;
    }

    scene.environment = studioEnvironment();

    /* -- light and ground -------------------------------------------------- */

    scene.add(new THREE.HemisphereLight(0xede7db, 0x24100a, 0.8));

    var keyLight = new THREE.DirectionalLight(0xfff0da, 2.05);
    keyLight.position.set(3.6, 4.4, 4.6);
    scene.add(keyLight);

    var rimLight = new THREE.DirectionalLight(0xd8552b, 2.1);
    rimLight.position.set(-4.2, 1.9, -3.4);
    scene.add(rimLight);

    var fillLight = new THREE.DirectionalLight(0xb9c3d6, 0.5);
    fillLight.position.set(-2.4, 1.2, 4);
    scene.add(fillLight);

    /* Follows the camera so whichever flank we are looking at keeps its
       form, whatever angle the machine has been rotated to. */
    var camFill = new THREE.DirectionalLight(0xffe8d2, 0.75);
    scene.add(camFill);
    scene.add(camFill.target);

    var headLight = new THREE.PointLight(0xffbd78, 1.1, 5.5, 2);
    headLight.position.set(1.15, 1.0, 0);
    scene.add(headLight);

    var floorMap = radialTexture([
      [0, "rgba(216,85,43,0.34)"],
      [0.42, "rgba(122,40,22,0.14)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({ map: floorMap, transparent: true, depthWrite: false, opacity: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.004;
    scene.add(floor);

    var contactMap = radialTexture([
      [0, "rgba(0,0,0,0.9)"],
      [0.55, "rgba(0,0,0,0.34)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    var contact = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 1.7),
      new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, depthWrite: false, opacity: 0.85 }),
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.001;
    scene.add(contact);

    /* -- dust -------------------------------------------------------------- */

    var dustCount = narrow ? 70 : 150;
    var dustPositions = new Float32Array(dustCount * 3);
    for (var d = 0; d < dustCount; d++) {
      dustPositions[d * 3] = (Math.random() - 0.5) * 8;
      dustPositions[d * 3 + 1] = Math.random() * 3.2;
      dustPositions[d * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    var dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    var dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: 0xd8552b,
        size: 0.022,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    scene.add(dust);

    /* -- materials --------------------------------------------------------- */

    var MAT = {
      paint: new THREE.MeshStandardMaterial({ color: 0x8d332b, roughness: 0.3, metalness: 0.34, envMapIntensity: 1.15 }),
      cream: new THREE.MeshStandardMaterial({ color: 0xede7db, roughness: 0.38, metalness: 0.24, envMapIntensity: 1 }),
      rubber: new THREE.MeshStandardMaterial({ color: 0x1b1714, roughness: 0.92, metalness: 0.03, envMapIntensity: 0.5 }),
      metal: new THREE.MeshStandardMaterial({ color: 0xb3aa9d, roughness: 0.28, metalness: 0.86, envMapIntensity: 1.5 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x332d26, roughness: 0.54, metalness: 0.46, envMapIntensity: 1.1 }),
      orange: new THREE.MeshStandardMaterial({
        color: 0xd8552b,
        roughness: 0.34,
        metalness: 0.3,
        emissive: 0x481505,
        emissiveIntensity: 0.4,
        envMapIntensity: 1.2,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: 0xffdca8,
        emissive: 0xffb066,
        emissiveIntensity: 2.4,
        roughness: 0.25,
        metalness: 0.1,
      }),
    };
    /* -- the machine ------------------------------------------------------- */

    var WHEEL_Y = 0.475;
    var bike = new THREE.Group();
    scene.add(bike);

    var parts = [];
    function addPart(name, explode, build) {
      var group = new THREE.Group();
      group.name = name;
      group.userData.explode = new THREE.Vector3(explode[0], explode[1], explode[2]);
      build(group);
      bike.add(group);
      parts.push(group);
      return group;
    }

    var tireGeo = new THREE.TorusGeometry(0.395, 0.08, 14, 56);
    var rimGeo = new THREE.TorusGeometry(0.312, 0.017, 8, 48);
    var hubGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.18, 20);
    var spokeGeo = new THREE.BoxGeometry(0.012, 0.63, 0.012);
    var discGeo = new THREE.TorusGeometry(0.185, 0.011, 6, 32);
    var caliperGeo = new THREE.BoxGeometry(0.055, 0.12, 0.045);

    function buildWheel(x, rimMaterial) {
      return function (group) {
        var center = new THREE.Vector3(x, WHEEL_Y, 0);

        var tire = new THREE.Mesh(tireGeo, MAT.rubber);
        tire.position.copy(center);
        group.add(tire);

        var rim = new THREE.Mesh(rimGeo, rimMaterial);
        rim.position.copy(center);
        group.add(rim);

        var hub = new THREE.Mesh(hubGeo, MAT.metal);
        hub.rotation.x = Math.PI / 2;
        hub.position.copy(center);
        group.add(hub);

        for (var i = 0; i < 10; i++) {
          var spoke = new THREE.Mesh(spokeGeo, MAT.metal);
          spoke.rotation.z = (i / 10) * Math.PI;
          spoke.position.copy(center);
          group.add(spoke);
        }

        var disc = new THREE.Mesh(discGeo, MAT.metal);
        disc.position.set(x, WHEEL_Y, 0.085);
        group.add(disc);

        var caliper = new THREE.Mesh(caliperGeo, MAT.orange);
        caliper.position.set(x + 0.01, WHEEL_Y + 0.215, 0.095);
        group.add(caliper);
      };
    }

    addPart("wheel-front", [0.5, 0.02, 0.3], buildWheel(0.95, MAT.cream));
    addPart("wheel-rear", [-0.5, 0.02, 0.3], buildWheel(-0.95, MAT.cream));

    addPart("frame", [0, 0.02, -0.12], function (group) {
      group.add(tube([0.7, 1.03, 0], [0.24, 0.9, 0], 0.028, MAT.cream));
      group.add(tube([0.7, 1.03, 0], [0.42, 0.52, 0], 0.026, MAT.cream));
      group.add(tube([0.42, 0.52, 0], [0.04, 0.71, 0], 0.024, MAT.cream));
      group.add(tube([0.24, 0.9, 0], [-0.52, 0.88, 0], 0.028, MAT.cream));
      group.add(tube([-0.52, 0.88, 0], [-0.24, 0.54, 0], 0.024, MAT.cream));
      group.add(tube([-0.24, 0.54, 0], [0.42, 0.52, 0], 0.024, MAT.cream));
      group.add(tube([0.24, 0.9, 0.05], [-0.52, 0.88, 0.05], 0.014, MAT.cream));
      group.add(tube([0.24, 0.9, -0.05], [-0.52, 0.88, -0.05], 0.014, MAT.cream));
      group.add(tube([-0.24, 0.54, 0], [-0.95, WHEEL_Y, 0], 0.021, MAT.metal));
      group.add(tube([-0.52, 0.86, 0], [-0.22, 0.56, 0], 0.03, MAT.orange));
      group.add(tube([0.7, 1.03, 0], [0.66, 0.88, 0], 0.022, MAT.metal));
    });

    addPart("front", [0.22, 0.26, 0.14], function (group) {
      [-0.095, 0.095].forEach(function (z) {
        group.add(tube([0.95, WHEEL_Y, z], [0.74, 1.02, z], 0.026, MAT.metal));
        group.add(tube([0.9, 0.8, z], [0.73, 1.04, z], 0.032, MAT.cream));
      });

      var clamp = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.27), MAT.cream);
      clamp.position.set(0.72, 1.035, 0);
      group.add(clamp);

      var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.58, 14), MAT.metal);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(0.84, 1.07, 0);
      group.add(bar);

      [-0.255, 0.255].forEach(function (z) {
        var grip = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.12, 14), MAT.rubber);
        grip.rotation.x = Math.PI / 2;
        grip.position.set(0.84, 1.07, z);
        group.add(grip);
      });

      var shell = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.096, 0.11, 24), MAT.cream);
      shell.rotation.z = Math.PI / 2;
      shell.position.set(0.94, 0.99, 0);
      group.add(shell);

      var lens = new THREE.Mesh(new THREE.CircleGeometry(0.086, 24), MAT.glass);
      lens.rotation.y = Math.PI / 2;
      lens.position.set(1.001, 0.99, 0);
      group.add(lens);

      var stay = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 10), MAT.metal);
      stay.rotation.z = Math.PI / 2;
      stay.position.set(0.86, 1.0, 0.1);
      group.add(stay);
    });

    addPart("tank", [0.08, 0.42, 0], function (group) {
      var tank = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), MAT.paint);
      tank.scale.set(0.4, 0.185, 0.205);
      tank.position.set(0.2, 0.94, 0);
      group.add(tank);

      var stripe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.012, 0.032), MAT.cream);
      stripe.position.set(0.2, 1.113, 0);
      group.add(stripe);

      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 20), MAT.metal);
      cap.position.set(0.11, 1.122, 0);
      group.add(cap);

      [-0.19, 0.19].forEach(function (z) {
        var badge = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.012, 20), MAT.cream);
        badge.rotation.x = Math.PI / 2;
        badge.position.set(0.28, 0.95, z);
        group.add(badge);

        var pin = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.018, 16), MAT.orange);
        pin.rotation.x = Math.PI / 2;
        pin.position.set(0.28, 0.95, z);
        group.add(pin);
      });
    });

    addPart("seat", [-0.1, 0.36, -0.08], function (group) {
      var seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.075, 0.21), MAT.dark);
      seat.position.set(-0.36, 0.895, 0);
      group.add(seat);

      var tail = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), MAT.paint);
      tail.scale.set(0.18, 0.115, 0.175);
      tail.position.set(-0.62, 0.9, 0);
      group.add(tail);

      var stitch = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.006, 0.02), MAT.orange);
      stitch.position.set(-0.4, 0.936, 0);
      group.add(stitch);

      var tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.045, 0.09), MAT.orange);
      tailLight.position.set(-0.795, 0.905, 0);
      group.add(tailLight);
    });

    addPart("engine", [0.02, -0.1, 0.32], function (group) {
      var block = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), MAT.dark);
      block.position.set(0.26, 0.6, 0);
      group.add(block);

      for (var i = 0; i < 5; i++) {
        var fin = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.01, 0.32), MAT.metal);
        fin.position.set(0.26, 0.5 + i * 0.036, 0);
        group.add(fin);
      }

      var head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.244), MAT.metal);
      head.position.set(0.3, 0.795, 0);
      group.add(head);

      [-0.155, 0.155].forEach(function (z) {
        var cover = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.03, 24), MAT.cream);
        cover.rotation.x = Math.PI / 2;
        cover.position.set(0.22, 0.6, z);
        group.add(cover);

        var bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 16), MAT.orange);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(0.22, 0.6, z);
        group.add(bolt);
      });
    });

    addPart("exhaust", [-0.06, -0.06, -0.34], function (group) {
      var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.36, 0.52, -0.12),
        new THREE.Vector3(0.22, 0.4, -0.15),
        new THREE.Vector3(-0.15, 0.37, -0.16),
        new THREE.Vector3(-0.55, 0.42, -0.16),
        new THREE.Vector3(-0.72, 0.47, -0.16),
      ]);
      var pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.026, 8, false), MAT.metal);
      group.add(pipe);

      var muffler = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.3, 20), MAT.cream);
      muffler.rotation.z = Math.PI / 2;
      muffler.position.set(-0.86, 0.49, -0.16);
      group.add(muffler);

      var tip = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.008, 6, 16), MAT.orange);
      tip.rotation.y = Math.PI / 2;
      tip.position.set(-1.008, 0.49, -0.16);
      group.add(tip);
    });

    addPart("fenders", [0.14, 0.22, 0.34], function (group) {
      var front = new THREE.Mesh(new THREE.TorusGeometry(0.535, 0.014, 6, 28, Math.PI * 0.58), MAT.cream);
      front.position.set(0.95, WHEEL_Y, 0);
      front.rotation.z = Math.PI * 0.21;
      group.add(front);

      var rear = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.016, 6, 24, Math.PI * 0.46), MAT.orange);
      rear.position.set(-0.95, WHEEL_Y, 0);
      rear.rotation.z = Math.PI * 0.36;
      group.add(rear);
    });

    addPart("details", [0, 0.18, 0.24], function (group) {
      [-0.1, 0.1].forEach(function (z) {
        var peg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 10), MAT.metal);
        peg.rotation.x = Math.PI / 2;
        peg.position.set(-0.05, 0.48, z);
        group.add(peg);
      });

      var plate = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 20), MAT.cream);
      plate.rotation.x = Math.PI / 2;
      plate.position.set(-0.55, 0.72, -0.14);
      group.add(plate);

      var lamp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), MAT.orange);
      lamp.position.set(0.72, 0.9, 0.13);
      group.add(lamp);
    });

    var glowMap = radialTexture([
      [0, "rgba(255,204,140,0.95)"],
      [0.35, "rgba(216,85,43,0.45)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    var glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowMap,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.3,
      }),
    );
    glow.position.set(1.1, 0.99, 0);
    glow.scale.set(1.5, 1.5, 1);
    scene.add(glow);
    /* -- camera choreography ----------------------------------------------- */

    var KEYS = [
      { at: 0.0, az: 45, el: 10.2, dist: 4.06, look: [0.05, 0.72, 0], panX: 0, panY: 0, rot: -0.72, explode: 0.0, key: 3.1, rim: 2.5, glow: 0.32 },
      { at: 0.3, az: 37.3, el: 6.8, dist: 3.93, look: [0.26, 0.7, 0], panX: 0, panY: 0, rot: -0.34, explode: 0.95, key: 2.7, rim: 2.7, glow: 0.34 },
      { at: 0.58, az: -36, el: 6.2, dist: 3.98, look: [0.08, 0.8, 0], panX: 0, panY: 0, rot: 0.56, explode: 0.0, key: 2.8, rim: 1.9, glow: 0.3 },
      { at: 1.0, az: 41, el: 3, dist: 3.24, look: [0.0, 0.66, 0], panX: 0.6, panY: 0, rot: -0.1, explode: 0.0, key: 2.9, rim: 2.6, glow: 0.5 },
    ];

    /* Framing: the machine must clear the copy column on desktop and sit above
       the text block on portrait phones, so distance and pan are responsive. */
    var FRAME = {
      wide: { dist: 2.05, panX: -1.55, panY: -0.02, panScale: 1, explode: 0.86 },
      narrow: { dist: 3.55, panX: 0, panY: -0.6, panScale: 0, explode: 0.5 },
      /* The static spread is a wide letterbox with the copy underneath, so the
         machine can sit centred and much larger than it does in the film. */
      staticWide: { dist: 1.1, panX: 0, panY: -0.3, panScale: 0, explode: 0.55 },
      staticNarrow: { dist: 1.98, panX: 0, panY: -0.25, panScale: 0, explode: 0.5 },
    };

    var target = 0;
    var current = 0;
    var raf = 0;
    var visible = false;
    var pointer = { tx: 0, ty: 0, x: 0, y: 0 };
    var lookTarget = new THREE.Vector3();
    var viewDir = new THREE.Vector3();
    var viewRight = new THREE.Vector3();
    var worldUp = new THREE.Vector3(0, 1, 0);
    var cameraPos = new THREE.Vector3();

    function apply(progress, time, snap) {
      var t = Math.max(0, Math.min(1, progress));
      var index = 0;
      while (index < KEYS.length - 2 && t > KEYS[index + 1].at) index++;

      var a = KEYS[index];
      var b = KEYS[index + 1];
      var local = smoothstep((t - a.at) / (b.at - a.at));

      var frame;
      if (staticMode) frame = narrow ? FRAME.staticNarrow : FRAME.staticWide;
      else frame = narrow ? FRAME.narrow : FRAME.wide;
      var az = (mix(a.az, b.az, local) * Math.PI) / 180;
      var el = (mix(a.el, b.el, local) * Math.PI) / 180;
      var dist = mix(a.dist, b.dist, local) * frame.dist;
      var look = mix3(a.look, b.look, local);
      var panX = mix(a.panX, b.panX, local) * frame.panScale + frame.panX;
      var panY = mix(a.panY, b.panY, local) + frame.panY;

      lookTarget.set(look[0], look[1], look[2]);
      cameraPos.set(
        look[0] + Math.cos(el) * Math.sin(az) * dist,
        look[1] + Math.sin(el) * dist,
        look[2] + Math.cos(el) * Math.cos(az) * dist,
      );

      /* Pan the whole rig along its own right axis so the machine can sit
         right-of-centre without changing the angle of the shot. */
      viewDir.subVectors(lookTarget, cameraPos).normalize();
      viewRight.crossVectors(viewDir, worldUp).normalize();
      cameraPos.addScaledVector(viewRight, panX);
      lookTarget.addScaledVector(viewRight, panX);
      cameraPos.y += panY;
      lookTarget.y += panY;

      cameraPos.x += pointer.x * 0.24;
      cameraPos.y += pointer.y * -0.14 + Math.sin(time * 0.4) * 0.018;

      if (snap) {
        camera.position.copy(cameraPos);
        cameraLook.copy(lookTarget);
      } else {
        camera.position.lerp(cameraPos, 0.1);
        cameraLook.lerp(lookTarget, 0.12);
      }
      camera.lookAt(cameraLook);
      camFill.position.copy(camera.position);
      camFill.target.position.copy(cameraLook);

      var rotation = a.rot + (b.rot - a.rot) * local;
      bike.rotation.y = snap ? rotation : bike.rotation.y + (rotation - bike.rotation.y) * 0.1;

      var explode = mix(a.explode, b.explode, local) * frame.explode;
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        part.position.copy(part.userData.explode).multiplyScalar(explode * 0.55);
      }

      keyLight.intensity = mix(a.key, b.key, local);
      rimLight.intensity = mix(a.rim, b.rim, local);

      var glowAmount = mix(a.glow, b.glow, local);
      glow.material.opacity = glowAmount;
      glow.scale.setScalar(1.35 + glowAmount);
      MAT.glass.emissiveIntensity = 1.7 + glowAmount * 3;
      headLight.intensity = 0.45 + glowAmount * 2;

      dust.rotation.y = time * 0.02;
      dust.position.y = Math.sin(time * 0.18) * 0.06;
    }

    function frame(now) {
      raf = window.requestAnimationFrame(frame);
      if (!visible) return;
      var time = (now - clockStart) / 1000;
      current += (target - current) * 0.085;
      if (Math.abs(target - current) < 0.0004) current = target;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      apply(current, time, false);
      renderer.render(scene, camera);
    }

    function start() {
      if (!raf) raf = window.requestAnimationFrame(frame);
    }

    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    /* -- sizing ------------------------------------------------------------ */

    function resize() {
      narrow = window.innerWidth < 860;
      var width = host.clientWidth || window.innerWidth;
      var height = host.clientHeight || window.innerHeight;
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 1.8));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (staticMode) {
        apply(target, 0, true);
        renderer.render(scene, camera);
      }
    }

    window.addEventListener("resize", resize);

    /* -- pointer atmosphere ------------------------------------------------ */

    function onPointerMove(event) {
      var rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function onPointerLeave() {
      pointer.tx = 0;
      pointer.ty = 0;
    }

    var pointerHost = host.parentElement;
    if (pointerHost && finePointer && !reducedMotion) {
      pointerHost.addEventListener("pointermove", onPointerMove, { passive: true });
      pointerHost.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    /* -- visibility + public API ------------------------------------------- */

    var observer = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
          });
        },
        { rootMargin: "12% 0px 12% 0px" },
      );
      observer.observe(host);
    } else {
      visible = true;
      start();
    }

    function setProgress(progress, immediate) {
      target = Math.max(0, Math.min(1, progress || 0));
      if (immediate) {
        current = target;
        apply(current, (performance.now() - clockStart) / 1000, true);
        renderer.render(scene, camera);
      }
      if (visible) start();
    }

    function renderStatic() {
      staticMode = true;
      stop();
      current = target;
      apply(current, 0, true);
      renderer.render(scene, camera);
    }

    function dispose() {
      stop();
      if (observer) observer.disconnect();
      window.removeEventListener("resize", resize);
      if (pointerHost) {
        pointerHost.removeEventListener("pointermove", onPointerMove);
        pointerHost.removeEventListener("pointerleave", onPointerLeave);
      }
      scene.traverse(function (object) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          var materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(function (material) {
            Object.keys(material).forEach(function (property) {
              var value = material[property];
              if (value && value.isTexture) value.dispose();
            });
            material.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    resize();
    apply(0, 0, true);
    renderer.render(scene, camera);
    visible = true;
    start();

    return { setProgress: setProgress, renderStatic: renderStatic, resize: resize, dispose: dispose };
  }
})();
