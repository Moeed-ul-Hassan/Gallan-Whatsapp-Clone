import os

def count_lines(directory):
    total_lines = 0
    file_counts = {}
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.py', '.tsx', '.ts', '.js', '.jsx', '.json', '.css', '.html')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        line_count = sum(1 for _ in f)
                        total_lines += line_count
                        file_counts[file_path] = line_count
                except:
                    print(f"Could not read {file_path}")
    
    return total_lines, file_counts

directory = "."  # Current directory
total, files = count_lines(directory)

print(f"\nTotal lines in project: {total}")
print("\nBreakdown by file:")
for file, count in files.items():
    print(f"{file}: {count} lines")