const Status = ({ status }: { status: string }) => {
  const address = "test";

  return (
    <div className={`button button--status ${address ? "on" : ""}`}>
      {status}
    </div>
  );
};

export default Status;
