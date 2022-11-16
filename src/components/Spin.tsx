const Spin = ({
  onSpin,
  disabled,
}: {
  onSpin: () => void;
  disabled: boolean;
}) => {
  const address = "test";

  return (
    <button
      className={`button button--spin ${address ? "on" : ""}`}
      onClick={onSpin}
      disabled={address === null || disabled}
    >
      SPIN
    </button>
  );
};

export default Spin;
