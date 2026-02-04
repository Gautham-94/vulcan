import { Request, Response } from 'express';

// Example user controller

const getUsers = (_req: Request, res: Response): void => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  res.json({ success: true, data: users });
};

const getUserById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const user = { id, name: 'John Doe', email: 'john@example.com' };
  res.json({ success: true, data: user });
};

const createUser = (req: Request, res: Response): void => {
  const { name, email } = req.body;
  const newUser = { id: 3, name, email };
  res.status(201).json({ success: true, data: newUser });
};

const updateUser = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { name, email } = req.body;
  const updatedUser = { id, name, email };
  res.json({ success: true, data: updatedUser });
};

const deleteUser = (req: Request, res: Response): void => {
  const { id } = req.params;
  res.json({ success: true, message: `User ${id} deleted` });
};

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
