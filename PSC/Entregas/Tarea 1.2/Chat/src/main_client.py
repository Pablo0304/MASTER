import sys
from participant import Participant

if __name__ == "__main__":
    # Simple check to allow passing nickname as argument
    if len(sys.argv) > 1:
        nickname = sys.argv[1]
    else:
        nickname = input("Enter your nickname: ")

    client = Participant(nickname)
    client.run_ui()
