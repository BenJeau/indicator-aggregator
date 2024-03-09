# Inter-microservice communication

To communicate between microservices, [gRPC](https://grpc.io/) is used for the following reasons:
* Has documented schema for data transported using using [Protobuf](https://protobuf.dev/)
* Transport can be binary and results in less load than JSON messages
* Smaller message size due to shared schema between client and server
* Can use HTTP/2 or HTTP/3

Other alternatives were considered, such as:
- [tarpc](https://github.com/google/tarpc) - a Rust RPC without a DSL (e.g. Protobuf) using Rust to define schemas made by Google
  - Reason not used
    1. Not as widely popular as gRPC
    2. Rust specific
    3. No big reason
- Kafka message-based communication
  - Reason not used
    1. Introduces an unnecessary extra system to manage messages
    2. Requests are easier if an immediate (or almost immediate) response is sent back, decreasing complexity
- a simple REST API
  - Reason not used
    1. Since communication is made between microservices, 

> **Note**: Currently Indicator Aggregator is not fault-tolerant if a microservice is down, the request will result in it not being processed. This could be alleviated by using Kafka, but is out of scope for the application. This would rather be the problem of the user/consumer of the application, although this can be revisited.