// Example user controller

const getUsers = (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  res.json({ success: true, data: users });
};

const getUserById = (req, res) => {
  const { id } = req.params;
  const user = { id, name: 'John Doe', email: 'john@example.com' };
  res.json({ success: true, data: user });
};

const createUser = (req, res) => {
  const { name, email } = req.body;
  const newUser = { id: 3, name, email };
  res.status(201).json({ success: true, data: newUser });
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const updatedUser = { id, name, email };
  res.json({ success: true, data: updatedUser });
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: `User ${id} deleted` });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
