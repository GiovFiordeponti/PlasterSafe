#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "lsm303dlhc.h"
#include "lsm303dlhc_params.h"
#include "xtimer.h"

lsm303dlhc_t dev;

int16_t temp_value;
lsm303dlhc_3d_data_t acc_value;

int main(void)
{
    if (lsm303dlhc_init(&dev, &lsm303dlhc_params[0]) == 0)
    {
        printf("start\n");
    }
    else
    {
        printf("failed\n");
        return 1;
    }
    //float acc_x = 0.0;
    //float acc_y = 0.0;
    //float acc_z = 0.0;
    //float mag_x = 0.0;
    //float mag_y = 0.0;
    //float mag_z = 0.0;

    while (1)
    {
        if (lsm303dlhc_read_acc(&dev, &acc_value) == 0)
        {
            printf("%i %i %i\n", acc_value.x_axis,
                   acc_value.y_axis,
                   acc_value.z_axis);
        }
        else
        {
            printf("failed\n");
        }

        if (lsm303dlhc_read_temp(&dev, &temp_value) == 0)
        {
            printf("%i\n", temp_value);
        }
        else
        {
            printf("failed\n");
        }

        xtimer_sleep(1);
    }

    /* should be never reached */
    printf("stop\n");
    return 0;
}