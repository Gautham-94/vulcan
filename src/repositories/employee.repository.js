const prisma = require('../config/database');

class EmployeeRepository {
  async findAll() {
    return await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.employee.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async create(data) {
    return await prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        position: data.position,
        department: data.department,
        salary: data.salary,
        hireDate: new Date(data.hireDate),
      },
    });
  }

  async update(id, data) {
    const updateData = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.position) updateData.position = data.position;
    if (data.department) updateData.department = data.department;
    if (data.salary) updateData.salary = data.salary;
    if (data.hireDate) updateData.hireDate = new Date(data.hireDate);

    return await prisma.employee.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async delete(id) {
    return await prisma.employee.delete({
      where: { id: parseInt(id) },
    });
  }

  async findByEmail(email) {
    return await prisma.employee.findUnique({
      where: { email },
    });
  }

  async findByDepartment(department) {
    return await prisma.employee.findMany({
      where: { department },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = new EmployeeRepository();
