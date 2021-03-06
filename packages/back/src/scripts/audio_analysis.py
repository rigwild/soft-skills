import sys

import parselmouth

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from moviepy.editor import *

# Usage:
#     python3 audio_analysis.py <audio_file_path> generate_plot_file <amplitude|intensity|pitch> <output_file>
#     python3 audio_analysis.py <audio_file_path> print_raw_data <amplitude|intensity|pitch>


def convert_video_to_audio(video):
    file_path = video
    video = VideoFileClip(video)
    audio = video.audio
    audio_file_name = file_path + ".wav"
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


def draw_intensity():
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
    spectrogram = snd.to_spectrogram()
    plt.figure()
    draw_spectrogram(spectrogram)
    plt.twinx()
    draw_intensity()
    plt.xlim([snd.xmin, snd.xmax])
    plt.savefig(output_path)


def plot_pitch(output_path):
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

# amplitude : pratt object
# number_of_points : number of points in the end (i.e. number of group formed and in which mean will
# be computed)
# max_data : number of maximum original value accepted until we perform a size reduction of the data


def reduce_size_amplitude(amplitude, number_of_points=1000, max_data=10000):
    if(len(amplitude.xs()) > max_data):
        abscisse = np.array_split(amplitude.xs(), number_of_points)
        ordonnee = np.array_split(list(amplitude.values.T), number_of_points)
        moyenne_abscisse = [np.mean(x) for x in abscisse]
        moyenne_ordonnee = [np.mean(x) for x in ordonnee]
        data = {"amplitude_x": moyenne_abscisse,
                "amplitude_y": moyenne_ordonnee}
    else:
        data = {"amplitude_x": amplitude.xs(),
                "amplitude_y": list(amplitude.values.T)}
    return(pd.DataFrame(data, columns=['amplitude_x', 'amplitude_y']))


def write_amplitude_data(output_file, number_of_points=1000, max_data=10000):
    dataframe = reduce_size_amplitude(
        snd, number_of_points=number_of_points, max_data=max_data)
    np.savetxt(output_file, dataframe, fmt='%.2f')


def write_intensity_data(output_file):
    data = {"intensity_x": intensity.xs(),
            "intensity_y": list(intensity.values.T)}
    dataframe = pd.DataFrame(data, columns=['intensity_x', 'intensity_y'])
    np.savetxt(output_file, dataframe, fmt='%.2f')


def write_pitch_data(output_file):
    data = {"pitch_x": pitch.xs(),
            "pitch_y": pitch.selected_array['frequency']}
    dataframe = pd.DataFrame(data, columns=['pitch_x', 'pitch_y'])
    np.savetxt(output_file, dataframe, fmt='%.2f')


def score_intensity():
    return(np.std(intensity.values.T)/np.mean(intensity.values.T))


def score_pitch():
    pitch_values = pitch.selected_array['frequency']
    return(np.std(pitch_values)/np.mean(pitch_values))


if len(sys.argv) < 2 or sys.argv[1] == '-h' or sys.argv[1] == '--help' or sys.argv[1] == 'help':
    print("Usage: python3 audio_analysis.py <audio_file_path>")
else:
    audio_file = convert_video_to_audio(sys.argv[1])
    sns.set()  # Use seaborn's default style to make attractive graphs
    snd = parselmouth.Sound(audio_file)
    intensity = snd.to_intensity()
    pitch = snd.to_pitch()
    amplitude_plot_file = audio_file + "_amplitude.png"
    intensity_plot_file = audio_file + "_intensity.png"
    pitch_plot_file = audio_file + "_pitch.png"
    amplitude_data_file = audio_file + "_amplitude.csv"
    intensity_data_file = audio_file + "_intensity.csv"
    pitch_data_file = audio_file + "_pitch.csv"
    # Generate plots files
    plot_amplitude_graph(amplitude_plot_file)
    plot_intensity_spectogram(intensity_plot_file)
    plot_pitch(pitch_plot_file)
    # Generate raw data files
    write_amplitude_data(amplitude_data_file)
    write_intensity_data(intensity_data_file)
    write_pitch_data(pitch_data_file)
    # Print plot files paths
    print(amplitude_plot_file)
    print("----------")
    print(intensity_plot_file)
    print("----------")
    print(pitch_plot_file)
    print("----------")
    # Print data files paths
    print(amplitude_data_file)
    print("----------")
    print(intensity_data_file)
    print("----------")
    print(pitch_data_file)
