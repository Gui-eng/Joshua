from win32com import client
import time
import os

word = client.Dispatch("Word.Application")

def printWordDocument(filename):

    word.Documents.Open(filename)
    word.ActiveDocument.PrintOut()
    time.sleep(2)
    word.ActiveDocument.Close()

current_directory = os.getcwd()
forms_path = os.path.join(os.path.expanduser("~"), "Desktop", "Reports", "forms", "dr.docx")

printWordDocument(forms_path)

word.Quit()