export function methodNotAllowed(allow) {
  return (req, res) => {
    res.set("Allow", allow);
    res.status(405).json({ message: `${req.method} is not supported here` });
  };
}
