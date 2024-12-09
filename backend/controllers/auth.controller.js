import User from '../models/user.model.js';
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};
export const login = (req, res) => {
  res.send('login route called');
};
export const logout = (req, res) => {
  res.send('logout route called');
};
