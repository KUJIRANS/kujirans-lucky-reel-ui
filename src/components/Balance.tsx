const Balance = () => {
  const address = "test";
  const balance = 0;

  return (
    <div className={`button button--balance ${address ? "on" : ""}`}>
      {balance} USK
    </div>
  );
};

export default Balance;
