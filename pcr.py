import tkinter as tk
from tkinter import messagebox

def start_experiment():
    try:
        denaturation_temp = float(entry_denaturation_temp.get())
        annealing_temp = float(entry_annealing_temp.get())
        extension_temp = float(entry_extension_temp.get())
        cycles = int(entry_cycles.get())
        duration = int(entry_duration.get())

        if cycles <= 0 or duration <= 0:
            raise ValueError("Cycles and duration must be positive values.")

        # Placeholder: Add logic to start the experiment
        messagebox.showinfo("Experiment Started", "PCR experiment has started with the given parameters.")

    except ValueError as e:
        messagebox.showerror("Invalid Input", f"Please enter valid values.\n{e}")

def reset_fields():
    entry_denaturation_temp.delete(0, tk.END)
    entry_annealing_temp.delete(0, tk.END)
    entry_extension_temp.delete(0, tk.END)
    entry_cycles.delete(0, tk.END)
    entry_duration.delete(0, tk.END)

# Create the main application window
root = tk.Tk()
root.title("PCR Experiment GUI")
root.geometry("400x400")

# Labels and entry fields for temperature inputs
label_denaturation_temp = tk.Label(root, text="Denaturation Temperature (°C):")
label_denaturation_temp.pack(pady=5)
entry_denaturation_temp = tk.Entry(root)
entry_denaturation_temp.pack(pady=5)

label_annealing_temp = tk.Label(root, text="Annealing Temperature (°C):")
label_annealing_temp.pack(pady=5)
entry_annealing_temp = tk.Entry(root)
entry_annealing_temp.pack(pady=5)

label_extension_temp = tk.Label(root, text="Extension Temperature (°C):")
label_extension_temp.pack(pady=5)
entry_extension_temp = tk.Entry(root)
entry_extension_temp.pack(pady=5)

# Label and entry field for cycles
label_cycles = tk.Label(root, text="Number of Cycles:")
label_cycles.pack(pady=5)
entry_cycles = tk.Entry(root)
entry_cycles.pack(pady=5)

# Label and entry field for duration
label_duration = tk.Label(root, text="Duration per Step (seconds):")
label_duration.pack(pady=5)
entry_duration = tk.Entry(root)
entry_duration.pack(pady=5)

# Buttons for starting and resetting the experiment
button_start = tk.Button(root, text="Start Experiment", command=start_experiment)
button_start.pack(pady=10)

button_reset = tk.Button(root, text="Reset", command=reset_fields)
button_reset.pack(pady=10)

# Run the application
root.mainloop()
