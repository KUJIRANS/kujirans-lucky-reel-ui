import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const Spinner = forwardRef((props, ref) => {
  const Reel1 = useRef<HTMLDivElement | null>(null);
  const Reel2 = useRef<HTMLDivElement | null>(null);
  const Reel3 = useRef<HTMLDivElement | null>(null);

  let SIZE = 215;
  let SLOTS_PER_REEL = 16;
  let REEL_RADIUS = Math.round(SIZE / 2 / Math.tan(Math.PI / SLOTS_PER_REEL));

  useEffect(() => {
    populate(Reel1.current);
    populate(Reel2.current);
    populate(Reel3.current);

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const resize = (reel: any) => {
    SIZE = Reel1.current?.offsetWidth || 215;
    REEL_RADIUS = Math.round(SIZE / 2 / Math.tan(Math.PI / SLOTS_PER_REEL));
    const slotAngle = 360 / SLOTS_PER_REEL;

    const list = document.querySelectorAll<HTMLElement>(".machine__reel div");
    for (var i = 0; i < list.length; i++) {
      const transform =
        "rotateX(" + slotAngle * i + "deg) translateZ(" + REEL_RADIUS + "px)";
      list[i].style.transform = transform;
    }
  };

  const populate = (reel: any) => {
    SIZE = Reel1.current?.offsetWidth || 215;
    REEL_RADIUS = Math.round(SIZE / 2 / Math.tan(Math.PI / SLOTS_PER_REEL));

    const slotAngle = 360 / SLOTS_PER_REEL;
    const seed = Math.floor(Math.random() * SLOTS_PER_REEL);
    for (var i = 0; i < SLOTS_PER_REEL; i++) {
      const slot = document.createElement("div");
      const transform =
        "rotateX(" + slotAngle * i + "deg) translateZ(" + REEL_RADIUS + "px)";
      slot.style.transform = transform;
      const img = document.createElement("img");
      img.src = `/spinnies/${i + 1}.png`;
      slot.append(img);
      reel.append(slot);
      reel.classList.add(`spin-${seed}`);
    }
  };

  useImperativeHandle(ref, () => ({
    spin() {
      // get from contract
      const p1 = Math.round(Math.random() * 16);
      const p2 = Math.round(Math.random() * 16);
      const p3 = Math.round(Math.random() * 16);
      doSpin(p1, p2, p3);
      //console.log(p1 + " | " + p2 + " | " + p3);
    },
  }));

  const doSpin = (v1: number, v2: number, v3: number) => {
    const timer = 2;

    Reel1.current?.classList.remove(...Reel1.current.classList);
    Reel1.current?.classList.add("machine__reel", `spin-${v1}`);
    Reel2.current?.classList.remove(...Reel2!.current?.classList);
    Reel2.current?.classList.add("machine__reel", `spin-${v2}`);
    Reel3.current?.classList.remove(...Reel3!.current?.classList);
    Reel3.current?.classList.add("machine__reel", `spin-${v3}`);

    Reel1.current!.style.animation =
      "back-spin 1s, spin-" + v1 + " " + (timer + 1 * 0.5) + "s";

    Reel2.current!.style.animation =
      "back-spin 1s, spin-" + v2 + " " + (timer + 2 * 0.5) + "s";

    Reel3.current!.style.animation =
      "back-spin 1s, spin-" + v3 + " " + (timer + 3 * 0.5) + "s";
  };

  return (
    <div className="machine__spinner">
      <div ref={Reel1} className="machine__reel"></div>
      <div ref={Reel2} className="machine__reel"></div>
      <div ref={Reel3} className="machine__reel"></div>
    </div>
  );
});

export default Spinner;
