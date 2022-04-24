import json
from dataclasses import dataclass, asdict


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
class ResponseBody:
    id: str
    taskData: TaskData


@dataclass
class Response:
    statusCode: int
    body: ResponseBody

    def into_lambda_response(self) -> dict:
        return {"statusCode": self.statusCode, "body": json.dumps(asdict(self.body))}


def handler(event, context):
    return {
        "statusCode": 200,
        "body": "hoge",
    }
