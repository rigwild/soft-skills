import parselmouth

import sys
import pandas as pd
import numpy as np


def get_pitch(snd):
    pitch = snd.to_pitch()
    data = {"pitch_x": pitch.xs(),
            "pitch_y": pitch.selected_array['frequency']}
    dataframe = pd.DataFrame(data, columns=['pitch_x', 'pitch_y'])
    np.savetxt(sys.stdout.buffer, dataframe, fmt='%.2f')


snd = parselmouth.Sound('NW001.wav')

get_pitch(snd)
