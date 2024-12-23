import tkinter as tk
from tkinter import messagebox

# Create the main application window
root = tk.Tk()

# Set the window title
root.title("Hello GUI")

# Set the window size
root.geometry("300x200")

# Create a label widget
label = tk.Label(root, text="Hello, World!", font=("Arial", 14))
label.pack(pady=20)

# Define what happens when the button is clicked
def on_button_click():
    messagebox.showinfo("Information", "Button Clicked!")

# Create a button widget
button = tk.Button(root, text="Click Me", command=on_button_click)
button.pack(pady=10)

# Start the GUI event loop
root.mainloop()
