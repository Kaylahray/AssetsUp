import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ScheduledTask, TaskStatus } from "../entities/scheduled-task.entity"
import { TaskExecution } from "../entities/task-execution.entity"
import type { CreateScheduledTaskDto } from "../dto/create-scheduled-task.dto"
import type { UpdateScheduledTaskDto } from "../dto/update-scheduled-task.dto"
import type { SchedulingService } from "./scheduling.service"

@Injectable()
export class TaskService {
  private readonly taskRepository: Repository<ScheduledTask>
  private readonly executionRepository: Repository<TaskExecution>
  constructor(
    @InjectRepository(ScheduledTask)
    taskRepository: Repository<ScheduledTask>,
    @InjectRepository(TaskExecution)
    executionRepository: Repository<TaskExecution>,
    private readonly schedulingService: SchedulingService,
  ) {
    this.taskRepository = taskRepository
    this.executionRepository = executionRepository
  }

  async create(createTaskDto: CreateScheduledTaskDto): Promise<ScheduledTask> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      status: createTaskDto.status || TaskStatus.ACTIVE,
      isEnabled: createTaskDto.isEnabled ?? true,
    })

    const savedTask = await this.taskRepository.save(task)

    // Register the task with the scheduling service
    if (savedTask.isEnabled && savedTask.status === TaskStatus.ACTIVE) {
      await this.schedulingService.registerTask(savedTask)
    }

    return savedTask
  }

  async findAll(): Promise<ScheduledTask[]> {
    return this.taskRepository.find({
      relations: ["executions"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<ScheduledTask> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["executions"],
    })

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    return task
  }

  async update(id: string, updateTaskDto: UpdateScheduledTaskDto): Promise<ScheduledTask> {
    const task = await this.findOne(id)

    // Update task properties
    Object.assign(task, updateTaskDto)
    const updatedTask = await this.taskRepository.save(task)

    // Re-register the task if it's enabled and active
    if (updatedTask.isEnabled && updatedTask.status === TaskStatus.ACTIVE) {
      await this.schedulingService.unregisterTask(updatedTask.id)
      await this.schedulingService.registerTask(updatedTask)
    } else {
      await this.schedulingService.unregisterTask(updatedTask.id)
    }

    return updatedTask
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id)

    // Unregister from scheduler
    await this.schedulingService.unregisterTask(id)

    // Remove task
    await this.taskRepository.remove(task)
  }

  async toggleStatus(id: string): Promise<ScheduledTask> {
    const task = await this.findOne(id)

    task.isEnabled = !task.isEnabled
    const updatedTask = await this.taskRepository.save(task)

    if (updatedTask.isEnabled && updatedTask.status === TaskStatus.ACTIVE) {
      await this.schedulingService.registerTask(updatedTask)
    } else {
      await this.schedulingService.unregisterTask(updatedTask.id)
    }

    return updatedTask
  }

  async recordExecution(taskId: string, executionData: Partial<TaskExecution>): Promise<TaskExecution> {
    const execution = this.executionRepository.create({
      taskId,
      ...executionData,
    })

    const savedExecution = await this.executionRepository.save(execution)

    // Update task execution statistics
    await this.updateTaskStats(taskId, executionData.status)

    return savedExecution
  }

  private async updateTaskStats(taskId: string, status: string): Promise<void> {
    const task = await this.findOne(taskId)

    task.executionCount += 1
    task.lastExecutedAt = new Date()

    if (status === "failed") {
      task.failureCount += 1
    }

    await this.taskRepository.save(task)
  }

  async getTaskExecutions(taskId: string): Promise<TaskExecution[]> {
    return this.executionRepository.find({
      where: { taskId },
      order: { createdAt: "DESC" },
    })
  }
}
