from kubernetes import client, config
import time, math

def load_client():
    config.load_incluster_config()
    return client.CoreV1Api()

def bind_pod(api, pod, node):
    target = client.V1ObjectReference(kind="Node", name=node)
    meta = client.V1ObjectMeta(name=pod.metadata.name)
    body = client.V1Binding(target=target, metadata=meta)
    api.create_namespaced_binding(pod.metadata.namespace, body, _preload_content=False)
    
def choose_node(api):
    nodes = api.list_node().items
    pods = api.list_pod_for_all_namespaces().items
    min_cnt, pick = math.inf, nodes[0].metadata.name
    for n in nodes:
        cnt = sum(1 for p in pods if p.spec.node_name == n.metadata.name)
        if cnt < min_cnt:
            min_cnt, pick = cnt, n.metadata.name
    return pick
    
def main():
    api = load_client()
    while True:
        pods = api.list_pod_for_all_namespaces(field_selector="spec.nodeName=").items
        for pod in pods:
            if pod.spec.scheduler_name != "my-scheduler":
                continue
            node = choose_node(api)
            bind_pod(api, pod, node)
            print(f"Bound {pod.metadata.name} -> {node}")
        time.sleep(2)
if __name__ == "__main__":
    main()
