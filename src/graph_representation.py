import networkx as nx
import matplotlib.pyplot as plt
import ast
import numpy as np

f = open("priya.txt")
contents = f.read()
dictionary = ast.literal_eval(contents)
f.close()


actions = {"key": [], "exact": []}

for i in range(len(dictionary["key"])):
    # shift
    if dictionary["key"][i] == 16:
        actions["key"].append("shift")
        actions["exact"].append("shift")
    # tab
    elif dictionary["key"][i] == 9:
        actions["key"].append("tab")
        actions["exact"].append("tab")
    # left
    elif dictionary["key"][i] == 37:
        actions["key"].append("left")
        actions["exact"].append("left")
    # right
    elif dictionary["key"][i] == 39:
        actions["key"].append("right")
        actions["exact"].append("right")
    # newline
    elif dictionary["key"][i] == 13:
        actions["key"].append("newline")
        actions["exact"].append("newline")
    # delete
    elif dictionary["key"][i] == 46:
        actions["key"].append("delete")
        actions["exact"].append("delete")
    # backspace
    elif dictionary["key"][i] == 8:
        actions["key"].append("backspace")
        actions["exact"].append("backspace")
    else:
        actions["key"].append("key")
        actions["exact"].append(chr(dictionary["key"][i]))

states = {"id": [], "state": [], "length": [], "cursor": [], "uni": [], "string": []}
nodecolor = []
edgecolor = []


key = False
delete = False
back = False
tab = False
id = -1
length = 0
ai = -1
dbi = -1
ddi = -1
dsi = -1
for i in range(len(actions["key"])):
    if (actions["key"][i] == "key" or actions["key"][i] == "shift") and key == False:
        id = id + 1
        ai = ai + 1
        states["id"].append(id)
        states["state"].append("addition")
        states["length"].append(0)
        states["cursor"].append(dictionary["selectionStart"][i])
        states["uni"].append("a" + str(ai))
        states["string"].append(actions["exact"][i])
        key = True
        delete = False
        back = False
        tab = False
    if actions["key"][i] == "delete" and delete == False:
        id = id + 1
        ddi = ddi + 1
        states["id"].append(id)
        states["state"].append("deletiond")
        states["length"].append(0)
        states["cursor"].append(dictionary["selectionStart"][i])
        states["uni"].append("dd" + str(ddi))
        states["string"].append(actions["exact"][i])
        delete = True
        key = False
        back = False
        tab = False
    if actions["key"][i] == "backspace" and back == False:
        dbi = dbi + 1
        id = id + 1
        states["id"].append(id)
        states["state"].append("deletionb")
        states["length"].append(0)
        states["cursor"].append(dictionary["selectionStart"][i])
        states["uni"].append("db" + str(dbi))
        states["string"].append(actions["exact"][i])
        back = True
        delete = False
        key = False
        tab = False
    if actions["key"][i] == "tab" and tab == False:
        dsi = dsi + 1
        id = id + 1
        states["id"].append(id)
        states["state"].append("suggestion")
        states["length"].append(0)
        states["cursor"].append(dictionary["selectionStart"][i])
        states["uni"].append("ds" + str(dsi))
        states["string"].append(actions["exact"][i])
        tab = True
        delete = False
        back = False
        key = False
    if (actions["key"][i] == "key" or actions["key"][i] == "shift") and key == True:
        states["length"][id] = states["length"][id] + 1
        states["string"][id] = states["string"][id] + actions["exact"][i]
    if actions["key"][i] == "backspace" and back == True:
        states["length"][id] = states["length"][id] + 1
    if actions["key"][i] == "delete" and delete == True:
        states["length"][id] = states["length"][id] + 1
    if actions["key"][i] == "tab" and tab == True:
        states["length"][id] = states["length"][id] + 1

for i in range(len(states["state"])):
    for j in range(len(states["state"])):
        if (
            states["cursor"][i] == states["cursor"][j]
            and states["id"][i] != states["id"][j]
            and states["state"][i] == "addition"
            and states["state"][j] == "addition"
        ):
            print(i, j)


deledges = []
deletebarr = {"id": [], "state": [], "length": [], "cursor": [], "uni": []}
deletedarr = {"id": [], "state": [], "length": [], "cursor": [], "uni": []}
addarr = {"id": [], "state": [], "length": [], "cursor": [], "uni": []}
suggestarr = {"id": [], "state": [], "length": [], "cursor": [], "uni": []}
for i in range(len(states["length"])):
    if states["state"][i] == "deletionb":
        deletebarr["id"].append(states["id"][i])
        deletebarr["state"].append(states["state"][i])
        deletebarr["length"].append(states["length"][i])
        deletebarr["cursor"].append(states["cursor"][i])
        deletebarr["uni"].append(states["uni"][i])
    if states["state"][i] == "deletiond":
        deletedarr["id"].append(states["id"][i])
        deletedarr["state"].append(states["state"][i])
        deletedarr["length"].append(states["length"][i])
        deletedarr["cursor"].append(states["cursor"][i])
        deletedarr["uni"].append(states["uni"][i])
    if states["state"][i] == "addition":
        addarr["id"].append(states["id"][i])
        addarr["state"].append(states["state"][i])
        addarr["length"].append(states["length"][i])
        addarr["cursor"].append(states["cursor"][i])
        addarr["uni"].append(states["uni"][i])
    if states["state"][i] == "suggestion":
        suggestarr["id"].append(states["id"][i])
        suggestarr["state"].append(states["state"][i])
        suggestarr["length"].append(states["length"][i])
        suggestarr["cursor"].append(states["cursor"][i])
        suggestarr["uni"].append(states["uni"][i])
sum = 0

print(states)
# backspace
print(deletebarr)
extra = 0


suggcardid = []
for i in range(1, len(dictionary["key"])):
    if not (dictionary["userText"][i] == dictionary["suggestionText"][i]):
        suggcardid.append(i)
        if (dictionary["key"][i]) == 8:
            print(dictionary["userText"][i])
            print(len(dictionary["userText"][i]))
            print(dictionary["suggestionText"][i])
            print(len(dictionary["suggestionText"][i]))
            print("-" * 20)
print("s:")
print(suggcardid)
print(states["state"])


for i in range(len(suggcardid)):
    sum = 0
    start = 0
    end = 0
    card = 0
    for j in range(len(states["length"])):
        sum = sum + states["length"][j]
        if sum > suggcardid[i]:
            card = j
            start = sum - states["length"][j]
            end = sum

    if states["state"][card] == "addition":
        for j in range(len(states["length"])):
            if states["id"][j] > card:
                states["id"][j] = states["id"][j] + 1
        a = suggcardid[i] - start
        states["string"].insert(
            states["id"][card] + 1, states["string"][card][a : states["length"][card]]
        )
        states["string"][card] = states["string"][card][0:a]

        states["id"].insert(states["id"][card] + 1, states["id"][card] + 1)
        states["length"].insert(states["id"][card] + 1, end - suggcardid[i])
        states["state"].insert(states["id"][card] + 1, "addition")
        states["cursor"].insert(states["id"][card] + 1, (states["cursor"][card] + a))
        states["length"][card] = states["length"][card] - (end - suggcardid[i])

        states["uni"].insert(states["id"][card] + 1, states["uni"][card] + "1")


# backspace-key
for i in range(len(deletebarr["length"])):

    cardid = 0
    tempmax = 0
    for j in range(deletebarr["id"][i] + extra):
        if states["state"][j] == "addition" or states["state"][j] == "suggestion":
            if states["cursor"][j] < deletebarr["cursor"][i]:
                temp = states["cursor"][j]
                if temp > tempmax:
                    cardid = states["id"][j]
                    tempmax = temp
    print(cardid)
    for j in range(len(states["length"])):
        if states["id"][j] > cardid:
            states["id"][j] = states["id"][j] + 1
    for j in range(len(states["length"])):
        if states["cursor"][j] > tempmax:
            states["cursor"][j] = states["cursor"][j] - deletebarr["length"][i]

    for j in range(len(deletebarr["length"])):
        if deletebarr["cursor"][j] > tempmax:
            deletebarr["cursor"][j] = deletebarr["cursor"][j] - deletebarr["length"][i]

    a = states["length"][cardid] - deletebarr["length"][i]
    states["string"].insert(
        states["id"][cardid] + 1, states["string"][cardid][a : states["length"][cardid]]
    )
    states["string"][cardid] = states["string"][cardid][0:a]

    states["id"].insert(states["id"][cardid] + 1, states["id"][cardid] + 1)
    states["length"].insert(states["id"][cardid] + 1, deletebarr["length"][i])

    states["state"].insert(states["id"][cardid] + 1, "abd")
    states["cursor"].insert(
        states["id"][cardid] + 1, (deletebarr["cursor"][i] - deletebarr["length"][i])
    )
    states["length"][cardid] = states["length"][cardid] - deletebarr["length"][i]

    states["uni"].insert(states["id"][cardid] + 1, deletebarr["uni"][i])

    extra = extra + 1


# delete-key-to-do
"""
for i in range(len(deletedarr["length"])):
    cardid = 0
    tempmax = 9999999999
    for j in range(len(states["length"])):
        if(states["state"][j]=="addition" or states["state"][j]=="suggestion"):
            if((states["cursor"][j]+states["length"][j])>deletedarr["cursor"][i] and states["id"][j] < deletedarr["id"][i]):
                temp = states["cursor"][j]
                if(temp<tempmax):
                    cardid = states["id"][j]
                    tempmax = temp
    for j in range(len(states["length"])):
        if states["id"][j] > cardid:
            states["id"][j] = states["id"][j] + 1
    for j in range(len(states["length"])):
        if states["cursor"][j] > tempmax:
            states["cursor"][j] = states["cursor"][j] - deletebarr["length"][i]

    states["length"][cardid] = states["length"][cardid] - deletebarr["length"][i]

    states["id"].insert(states["id"][cardid] + 1, states["id"][cardid] + 1)
    states["length"].insert(states["id"][cardid] + 1, deletebarr["length"][i])
    states["state"].insert(states["id"][cardid] + 1, "abdd")
    states["cursor"].insert(states["id"][cardid] + 1, deletebarr["cursor"][i] - deletebarr["length"][i])


"""


for i in range(len(states["length"])):
    for j in range(len(states["length"])):
        if states["uni"][i] == states["uni"][j] and not (
            states["id"][i] == states["id"][j]
        ):
            deledges.append((i, j))

finalred = []
for i in range(len(states["length"])):
    if states["state"][i] == "addition" and states["length"][i] > 0:
        before = 0
        beforecard = 0
        after = 99999999
        aftercard = 0
        for j in range(len(states["length"])):
            if states["length"][j] > 0:
                if states["state"][j] == "addition" and not (
                    states["id"][i] == states["id"][j]
                ):
                    if states["cursor"][j] < states["cursor"][i]:
                        if states["cursor"][j] > before:
                            before = states["cursor"][j]
                            beforecard = states["id"][j]
                    if states["cursor"][j] > states["cursor"][i]:
                        if states["cursor"][j] < after:
                            after = states["cursor"][j]
                            aftercard = states["id"][j]
        finalred.append((beforecard, i))
        finalred.append((i, aftercard))

print("+" * 20)
for i in range(len(states["length"])):
    for j in range(len(states["length"])):
        if (
            states["state"][i] == "addition"
            and states["state"][j] == "addition"
            and states["cursor"][i] == states["cursor"][j]
            and (states["id"][i] == states["id"][i])
        ):
            print("+" * 20)
            print(states["id"][i])
            print(states["id"][j])


county = 0
countb = 0
for i in range(len(states["state"])):
    if states["state"][i] == "abd":
        nodecolor.append("#BFBFBF")
        county = county + 1
    if states["state"][i] == "abdd":
        nodecolor.append("#BFBFBF")
        county = county + 1
    if states["state"][i] == "addition":
        nodecolor.append("black")
    if states["state"][i] == "suggestion":
        nodecolor.append("#34D145")
    if states["state"][i] == "deletiond":
        nodecolor.append("#FD403C")
        countb = countb + 1
    if states["state"][i] == "deletionb":
        nodecolor.append("#FD403C")
        countb = countb + 1


print(county)
print(countb)


for i in range(len(deletebarr["length"])):
    print(deletebarr["uni"][i])
    print(deletebarr["id"][i])

for i in range(len(states["length"])):
    if states["state"][i] == "abd":
        print(states["state"][i])
        print(states["uni"][i])
        print(states["id"][i])


for i in range(len(states["length"])):
    sum = sum + states["length"][i]

# print(sum)
# print(len(dictionary["key"]))
# print(actions)
# print(states)
# print(deledges)
G = nx.Graph()
G.add_nodes_from(states["id"])
for i in range(len(states["id"]) - 1):
    G.add_edge(i, i + 1, color="black")
G.add_edges_from(deledges, color="#FD403C")
G.add_edges_from(finalred, color="black")
edges = G.edges()
edgecolor = [G[u][v]["color"] for u, v in edges]


sizearray = np.array(states["length"]) * 20
# pos = nx.circular_layout(G)
# nx.draw(G, pos, node_color = nodecolor, node_size = sizearray, edge_color = edgecolor)
nx.draw(
    G, node_color=nodecolor, node_size=sizearray, edge_color=edgecolor, with_labels=True
)
plt.savefig("path_graph1.png")
plt.show()
