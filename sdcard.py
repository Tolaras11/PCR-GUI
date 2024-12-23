import tkinter as tk
from tkinter import filedialog, messagebox

def save_to_sd_card():
    file_name = file_name_entry.get()
    if not file_name.endswith(".pcr"):
        file_name += ".pcr"
    
    protocol_data = {
        "step1": {"temperature": step1_temp.get(), "cycles": step1_cycles.get(), "duration": step1_duration.get()},
        "step2": {"temperature": step2_temp.get(), "cycles": step2_cycles.get(), "duration": step2_duration.get()},
    }

    try:
        # Replace '/mnt/sdcard/' with the actual path to the SD card
        with open(f"D:/{file_name}", "w") as file:
            file.write(str(protocol_data))  # Convert to JSON-like string
        log_box.insert(tk.END, f"Protocol saved as {file_name} on SD card.\n")
    except Exception as e:
        log_box.insert(tk.END, f"Error saving protocol: {e}\n")

# Main GUI window
root = tk.Tk()
root.title("PCR GUI")

# PCR Settings Section
pcr_frame = tk.Frame(root, bd=2, relief="groove")
pcr_frame.pack(pady=10, padx=10, fill="x")

tk.Label(pcr_frame, text="PCR Settings").grid(row=0, column=0, columnspan=2)

# PCR Step 1 Inputs
tk.Label(pcr_frame, text="Step 1 Temp (°C):").grid(row=1, column=0)
step1_temp = tk.Entry(pcr_frame)
step1_temp.grid(row=1, column=1)

tk.Label(pcr_frame, text="Step 1 Cycles:").grid(row=2, column=0)
step1_cycles = tk.Entry(pcr_frame)
step1_cycles.grid(row=2, column=1)

tk.Label(pcr_frame, text="Step 1 Duration (s):").grid(row=3, column=0)
step1_duration = tk.Entry(pcr_frame)
step1_duration.grid(row=3, column=1)

# PCR Step 2 Inputs
tk.Label(pcr_frame, text="Step 2 Temp (°C):").grid(row=4, column=0)
step2_temp = tk.Entry(pcr_frame)
step2_temp.grid(row=4, column=1)

tk.Label(pcr_frame, text="Step 2 Cycles:").grid(row=5, column=0)
step2_cycles = tk.Entry(pcr_frame)
step2_cycles.grid(row=5, column=1)

tk.Label(pcr_frame, text="Step 2 Duration (s):").grid(row=6, column=0)
step2_duration = tk.Entry(pcr_frame)
step2_duration.grid(row=6, column=1)

# File Name Input
tk.Label(pcr_frame, text="File Name:").grid(row=7, column=0)
file_name_entry = tk.Entry(pcr_frame)
file_name_entry.grid(row=7, column=1)

# Save to SD Card Button
save_button = tk.Button(pcr_frame, text="Save to SD Card", command=save_to_sd_card)
save_button.grid(row=8, column=0, columnspan=2, pady=10)

# Log Box
log_frame = tk.Frame(root, bd=2, relief="groove")
log_frame.pack(pady=10, padx=10, fill="x")

log_box = tk.Text(log_frame, height=10, state="normal")
log_box.pack(fill="x")

root.mainloop()
