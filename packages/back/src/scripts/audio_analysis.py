import sys

import parselmouth

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

audio_file = sys.argv[1]
# output_path = sys.argv[2]
sns.set()  # Use seaborn's default style to make attractive graphs
snd = parselmouth.Sound(audio_file)


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


def plot_amplitude_graphe(output_path):
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


def print_pitch_data():
    pitch = snd.to_pitch()
    data = {"pitch_x": pitch.xs(),
            "pitch_y": pitch.selected_array['frequency']}
    dataframe = pd.DataFrame(data, columns=['pitch_x', 'pitch_y'])
    np.savetxt(sys.stdout.buffer, dataframe, fmt='%.2f')


plot_amplitude_graphe("output.png")
plot_intensity_spectogram("output_spectogram.png")
plot_pitch("spectrogram_0.03.png")
