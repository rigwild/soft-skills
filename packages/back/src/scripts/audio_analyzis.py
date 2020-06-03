import sys

import parselmouth

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from moviepy.editor import *

# Usage:
#     python3 audio_analyzis.py <audio_file_path> generate_plot_file <amplitude|intensity|pitch> <output_file>
#     python3 audio_analyzis.py <audio_file_path> print_raw_data <amplitude|intensity|pitch>


def convert_video_to_audio(video):
    file_path = video
    video = VideoFileClip(video)
    audio = video.audio
    audio_file_name = file_path + ".mp3"
    audio.write_audiofile(audio_file_name, verbose=False, logger=None)
    return(audio_file_name)


def draw_spectrogram(spectrogram, dynamic_range=70):
    X, Y = spectrogram.x_grid(), spectrogram.y_grid()
    sg_db = 10 * np.log10(spectrogram.values)
    plt.pcolormesh(X, Y, sg_db, vmin=sg_db.max() -
                   dynamic_range, cmap='afmhot')
    plt.ylim([spectrogram.ymin, spectrogram.ymax])
    plt.xlabel("time [s]")
    plt.ylabel("frequency [Hz]")


def draw_intensity(intensity):
    plt.plot(intensity.xs(), intensity.values.T, linewidth=3, color='w')
    plt.plot(intensity.xs(), intensity.values.T, linewidth=1)
    plt.grid(False)
    plt.ylim(0)
    plt.ylabel("intensity [dB]")


def plot_amplitude_graph(output_path):
    plt.figure()
    plt.plot(snd.xs(), snd.values.T)
    plt.xlim([snd.xmin, snd.xmax])
    plt.xlabel("time [s]")
    plt.ylabel("amplitude")
    plt.savefig(output_path)


def plot_intensity_spectogram(output_path):
    intensity = snd.to_intensity()
    spectrogram = snd.to_spectrogram()
    plt.figure()
    draw_spectrogram(spectrogram)
    plt.twinx()
    draw_intensity(intensity)
    plt.xlim([snd.xmin, snd.xmax])
    plt.savefig(output_path)


def plot_pitch(output_path):
    pitch = snd.to_pitch()
    pre_emphasized_snd = snd.copy()
    pre_emphasized_snd.pre_emphasize()
    spectrogram = pre_emphasized_snd.to_spectrogram(
        window_length=0.03, maximum_frequency=8000)
    plt.figure()
    draw_spectrogram(spectrogram)
    plt.twinx()
    pitch_values = pitch.selected_array['frequency']
    pitch_values[pitch_values == 0] = np.nan
    plt.plot(pitch.xs(), pitch_values, 'o', markersize=5, color='w')
    plt.plot(pitch.xs(), pitch_values, 'o', markersize=2)
    plt.grid(False)
    plt.ylim(0, pitch.ceiling)
    plt.ylabel("fundamental frequency [Hz]")
    plt.xlim([snd.xmin, snd.xmax])
    plt.savefig(output_path)


def print_amplitude_data():
    np.savetxt(sys.stdout.buffer, [0.0], fmt='%.2f')
    # data = {"amplitude_x": snd.xs(),
    #         "amplitude_y": list(snd.values.T)}
    # dataframe = pd.DataFrame(data, columns=['amplitude_x', 'amplitude_y'])
    # np.savetxt(sys.stdout.buffer, snd.values.T, fmt='%.2f')


def print_intensity_data():
    intensity = snd.to_intensity()
    data = {"intensity_x": intensity.xs(),
            "intensity_y": list(intensity.values.T)}
    dataframe = pd.DataFrame(data, columns=['intensity_x', 'intensity_y'])
    np.savetxt(sys.stdout.buffer, intensity.values.T, fmt='%.2f')


def print_pitch_data():
    pitch = snd.to_pitch()
    data = {"pitch_x": pitch.xs(),
            "pitch_y": pitch.selected_array['frequency']}
    dataframe = pd.DataFrame(data, columns=['pitch_x', 'pitch_y'])
    np.savetxt(sys.stdout.buffer, dataframe, fmt='%.2f')


if len(sys.argv) < 2 or sys.argv[1] == '-h' or sys.argv[1] == '--help' or sys.argv[1] == 'help':
    print("""Usage:
    python3 audio_analyzis.py <audio_file_path> generate_plot_file <amplitude|intensity|pitch> <output_file>
    python3 audio_analyzis.py <audio_file_path> print_raw_data <amplitude|intensity|pitch>""")
else:
    audio_file = convert_video_to_audio(sys.argv[1])
    command = sys.argv[2]
    sns.set()  # Use seaborn's default style to make attractive graphs
    snd = parselmouth.Sound(audio_file)
    if command == 'generate_plot_file':
        needed_data = sys.argv[3]
        output_path = sys.argv[4]
        if needed_data == 'amplitude':
            plot_amplitude_graph(output_path)
        elif needed_data == 'intensity':
            plot_intensity_spectogram(output_path)
        elif needed_data == 'pitch':
            plot_pitch(output_path)
    elif command == 'print_raw_data':
        needed_data = sys.argv[3]
        if needed_data == 'amplitude':
            print_amplitude_data()
        elif needed_data == 'intensity':
            print_intensity_data()
        if needed_data == 'pitch':
            print_pitch_data()
