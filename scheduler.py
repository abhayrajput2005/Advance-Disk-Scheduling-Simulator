def fcfs(requests, head):
    return [head] + list(requests)


def sstf(requests, head):
    order = [head]
    reqs = list(requests)

    while reqs:
        nearest = min(reqs, key=lambda x: abs(x - head))
        order.append(nearest)
        head = nearest
        reqs.remove(nearest)

    return order


def scan(requests, head, direction="right", disk_size=500):
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    order = [head]

    if direction == "right":
        order += right
        order.append(disk_size)
        order += list(reversed(left))
    else:
        order += list(reversed(left))
        order.append(0)
        order += right

    return order


def cscan(requests, head, direction="right", disk_size=500):
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    order = [head]

    if direction == "right":
        order += right
        order.append(disk_size)
        order.append(0)
        order += left
    else:
        order += list(reversed(left))
        order.append(0)
        order.append(disk_size)
        order += list(reversed(right))

    return order


def look(requests, head, direction="right"):
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    order = [head]

    if direction == "right":
        order += right
        order += list(reversed(left))
    else:
        order += list(reversed(left))
        order += right

    return order


def clook(requests, head, direction="right"):
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    order = [head]

    if direction == "right":
        order += right
        if left:
            order.append(left[0])
            order += left
    else:
        order += list(reversed(left))
        if right:
            order.append(right[-1])
            order += list(reversed(right))

    return order


def compute_seek(order):
    seek_seq = []
    for i in range(1, len(order)):
        seek_seq.append(abs(order[i] - order[i - 1]))
    return seek_seq


def simulate(data):
    requests = data.get("requests", [])
    head = data.get("initial_head", 0)
    algo = data.get("algorithm", "FCFS")
    direction = data.get("direction", "right")
    disk_size = data.get("disk_size", 500)

    if algo == "FCFS":
        order = fcfs(requests, head)
    elif algo == "SSTF":
        order = sstf(requests, head)
    elif algo == "SCAN":
        order = scan(requests, head, direction, disk_size)  
    elif algo == "C-SCAN":
        order = cscan(requests, head, direction, disk_size)
    elif algo == "LOOK":
        order = look(requests, head, direction)
    elif algo == "C-LOOK":
        order = clook(requests, head, direction)
    else:
        order = fcfs(requests, head)

    seek = compute_seek(order)
    return {
        "algorithm": algo,
        "order": order,
        "seek_sequence": seek,
        "total_seek": sum(seek)
    }
