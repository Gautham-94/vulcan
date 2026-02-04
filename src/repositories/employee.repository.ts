import { Employee, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { CreateEmployeeRequestDto, UpdateEmployeeRequestDto } from '../dto/request/employee.request.dto';

class EmployeeRepository {
  async findAll(): Promise<Employee[]> {
    return await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number | string): Promise<Employee | null> {
    return await prisma.employee.findUnique({
      where: { id: parseInt(id.toString()) },
    });
  }

  async create(data: CreateEmployeeRequestDto): Promise<Employee> {
    return await prisma.employee.create({
      data: {
        name: data.name!,
        email: data.email!,
        position: data.position!,
        department: data.department!,
        salary: data.salary!,
        hireDate: data.hireDate!,
      },
    });
  }

  async update(id: number | string, data: UpdateEmployeeRequestDto): Promise<Employee> {
    const updateData: Prisma.EmployeeUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.salary !== undefined) updateData.salary = data.salary;
    if (data.hireDate !== undefined) updateData.hireDate = data.hireDate;

    return await prisma.employee.update({
      where: { id: parseInt(id.toString()) },
      data: updateData,
    });
  }

  async delete(id: number | string): Promise<Employee> {
    return await prisma.employee.delete({
      where: { id: parseInt(id.toString()) },
    });
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return await prisma.employee.findUnique({
      where: { email },
    });
  }

  async findByDepartment(department: string): Promise<Employee[]> {
    return await prisma.employee.findMany({
      where: { department },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new EmployeeRepository();
