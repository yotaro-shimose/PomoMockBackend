import json
from dataclasses import dataclass, asdict


@dataclass
class ResponseBody:
    hoge: str = "hogehoge"


@dataclass
class Response:
    body: ResponseBody
    statusCode: int = 200

    def into_lambda_response(self) -> dict:
        return {
            "isBase64Encoded": False,
            "statusCode": self.statusCode,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": asdict(self.body),
        }


def handler(event, context):
    response = Response(ResponseBody())
    return response.into_lambda_response()
