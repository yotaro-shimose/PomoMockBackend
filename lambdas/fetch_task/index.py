import json
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class TaskData:
    name: str
    childrenIdList: list[str]
    done: bool
    finishedWorkload: int
    estimatedWorkload: int
    deadline: str
    notes: str


@dataclass
class Task:
    id: str
    taskData: TaskData


@dataclass
class ResponseBody:
    task: list[TaskData]
    rootTaskId: list[str]


@dataclass
class Response:
    body: ResponseBody
    statusCode: int = 200

    def into_lambda_response(self) -> dict:
        return {
            "statusCode": self.statusCode,
            "body": json.dumps(asdict(self.body)),
            "headers": {"Access-Control-Allow-Origin": "*"},
        }


def handler(event, context):

    tasks = [
        Task(
            "task1",
            TaskData(
                "taskname1",
                ["task2", "task3"],
                False,
                50,
                100,
                datetime(2023, 4, 29).isoformat(),
                "Root Task",
            ),
        ),
        Task(
            "task2",
            TaskData(
                "taskname2",
                ["task4"],
                False,
                25,
                50,
                datetime(2023, 4, 29).isoformat(),
                "Non Root Task",
            ),
        ),
        Task(
            "task3",
            TaskData(
                "taskname3",
                [],
                False,
                0,
                0,
                datetime(2023, 4, 29).isoformat(),
                "Non Root Task",
            ),
        ),
        Task(
            "task4",
            TaskData(
                "taskname4",
                [],
                False,
                25,
                50,
                datetime(2023, 4, 27).isoformat(),
                "Non Root Task",
            ),
        ),
    ]
    root_task_ids = "task1"
    response = Response(ResponseBody(task=tasks, rootTaskId=root_task_ids))
    print(response.into_lambda_response())
    return response.into_lambda_response()
