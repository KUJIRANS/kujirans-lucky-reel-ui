const Spin = ({ onSpin }: { onSpin: () => void }) => {
  const address = "test";

  return (
    <button
      className={`button button--spin ${address ? "on" : ""}`}
      onClick={onSpin}
      disabled={address === null}
    >
      SPIN
    </button>
  );
};

export default Spin;
