import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useSpring, animated, easings } from "react-spring";

const Spinner = forwardRef((props, ref) => {
  const Reel1 = useRef<HTMLDivElement | null>(null);
  const Reel2 = useRef<HTMLDivElement | null>(null);
  const Reel3 = useRef<HTMLDivElement | null>(null);

  const [preSpin, setPreSpin] = useState(false);

  const [angle1, setAngel1] = useState(0);
  const [angle2, setAngel2] = useState(0);
  const [angle3, setAngel3] = useState(0);

  const ani1 = useSpring({
    to: { rotateX: angle1 },
    config: {
      duration: preSpin ? 30000 : 2500,
      easing: easings.easeOutQuart,
    },
  });

  const ani2 = useSpring({
    to: { rotateX: angle2 },
    config: {
      duration: preSpin ? 30000 : 3000,
      easing: easings.easeOutQuart,
    },
  });

  const ani3 = useSpring({
    to: { rotateX: angle3 },
    config: {
      duration: preSpin ? 30000 : 3500,
      easing: easings.easeOutQuart,
    },
  });

  const SLOTS_PER_REEL = 16;
  const SLOT_ANGLE = 360 / SLOTS_PER_REEL;
  let SIZE = 215;
  let REEL_RADIUS = Math.round(SIZE / 2 / Math.tan(Math.PI / SLOTS_PER_REEL));

  useEffect(() => {
    populate(Reel1.current);
    populate(Reel2.current);
    populate(Reel3.current);

    window.addEventListener("resize", resize);
  }, []);

  const resize = (reel: any) => {
    SIZE = Reel1.current?.offsetWidth || 215;
    REEL_RADIUS = Math.round(SIZE / 2 / Math.tan(Math.PI / SLOTS_PER_REEL));

    const list = document.querySelectorAll<HTMLElement>(".machine__reel div");
    for (var i = 0; i < list.length; i++) {
      const transform =
        "rotateX(" + SLOT_ANGLE * i + "deg) translateZ(" + REEL_RADIUS + "px)";
      list[i].style.transform = transform;
    }
  };

  const populate = (reel: any) => {
    SIZE = Reel1.current?.offsetWidth || 215;
    REEL_RADIUS = Math.round(SIZE / 2 / Math.tan(Math.PI / SLOTS_PER_REEL));
    const start = Math.floor(Math.random() * SLOTS_PER_REEL);

    for (var i = 0; i < SLOTS_PER_REEL; i++) {
      const slot = document.createElement("div");
      const transform =
        "rotateX(" + SLOT_ANGLE * i + "deg) translateZ(" + REEL_RADIUS + "px)";
      slot.style.transform = transform;
      const img = document.createElement("img");
      img.src = `/spinnies/${i + 1}.png`;
      slot.append(img);
      reel.append(slot);
      // random start position
      reel.style.transform = "rotateX(" + SLOT_ANGLE * start + "deg)";
    }
  };

  useImperativeHandle(ref, () => ({
    Spin(p1: number, p2: number, p3: number, cb: () => void) {
      DoSpin(p1, p2, p3, cb);
    },
    Cancel() {},
    Prespin() {
      const t1 = Math.round(Math.random() * 16);
      const t2 = Math.round(Math.random() * 16);
      const t3 = Math.round(Math.random() * 16);
      setPreSpin(true);
      setAngel1(22.5 * t1);
      setAngel2(22.5 * t2);
      setAngel3(22.5 * t3);
    },
  }));

  const DoSpin = (v1: number, v2: number, v3: number, cb: () => void) => {
    const timer = 2000;

    setTimeout(() => {
      cb();
    }, timer * 1000);

    setPreSpin(false);
    setAngel1(-22.5 * v1 - 1800);
    setAngel2(-22.5 * v2 - 1800);
    setAngel3(-22.5 * v3 - 1800);
  };

  return (
    <div className="machine__spinner">
      <animated.div
        style={ani1}
        ref={Reel1}
        className="machine__reel"
      ></animated.div>
      <animated.div
        style={ani2}
        ref={Reel2}
        className="machine__reel"
      ></animated.div>
      <animated.div
        style={ani3}
        ref={Reel3}
        className="machine__reel"
      ></animated.div>
    </div>
  );
});

export default Spinner;
