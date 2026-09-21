"use client"

import React, { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { TasksFilters } from "./tasks-filters"
import { TasksTable } from "./tasks-table"
import { CreateTaskDialog } from "./create-task-dialog"
import type { GetTasksResult, TaskEntityOptions } from "@/lib/services/tasks.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"

interface TasksClientViewProps {
  tasksResult: GetTasksResult
  entityOptions: TaskEntityOptions
  members: OrganizationMemberOption[]
}

export function TasksClientView({
  tasksResult,
  entityOptions,
  members,
}: TasksClientViewProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tasks & Action Items"
        description="Track action items, priorities, due dates, and operational workflows linked to leads, customers, and deals."
        action={
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Task</span>
          </Button>
        }
      />

      {/* Filters Bar */}
      <TasksFilters members={members} />

      {/* Table View */}
      <TasksTable
        tasks={tasksResult.tasks}
        total={tasksResult.total}
        page={tasksResult.page}
        pageSize={tasksResult.pageSize}
        totalPages={tasksResult.totalPages}
        entityOptions={entityOptions}
        members={members}
        onCreateNew={() => setCreateDialogOpen(true)}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        entityOptions={entityOptions}
        members={members}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
